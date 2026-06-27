# Plan de implementación — Fase 2: Migración a Supabase

> Plan incremental por **fases independientes** para conectar la app (hoy frontend-only con IndexedDB + localStorage) a Supabase como backend real: base de datos Postgres, Auth con roles, Storage para portadas y RLS.
> Cada fase es un PR autocontenido con su propio entregable y criterio de "hecho". Hay orden natural entre algunas (F1 antes de F2, etc.), pero ninguna incluye trabajo a medias de la siguiente.
>
> **Modo de trabajo:** cada fase se diseña en detalle en Claude.ai (esta interfaz) antes de implementarla, y se pica con Claude Code referenciando este archivo y los de contexto (`CONTEXT.md`, `CLAUDE.md`) con `@`.

---

## Decisiones de proyecto (parametrización del plan)

Acordadas antes de empezar:

- **Backend:** Supabase (Postgres + Auth + Storage + RLS). Descartados Firebase y Appwrite por peor encaje con el modelo relacional (ver análisis previo).
- **Región:** EU (Frankfurt o Londres) por latencia desde España.
- **Cliente:** `@supabase/supabase-js` v2, instancia singleton.
- **CLI y migraciones:** Supabase CLI; migraciones SQL versionadas en `supabase/migrations/`. Nada de cambios de schema "a mano" desde el dashboard sin reflejarlos en migración.
- **Tipos:** generados por CLI (`supabase gen types typescript`) en `src/types/database.types.ts`, versionados.
- **Variables de entorno:** `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (cliente, bundleadas); `SUPABASE_SERVICE_ROLE_KEY` **sin** prefijo `VITE_` (solo scripts Node y Edge Functions, nunca en el bundle). `.env.local` en `.gitignore`; `.env.example` versionado sin valores.
- **Auth:** email/password con **emails reales**. Usuarios iniciales creados ya confirmados vía Admin API (`email_confirm: true`); confirmación de email del flujo de signup desactivada en Fase 1 por simplicidad.
- **Roles:** tabla `profiles` (1:1 con `auth.users`) con columna `role` (`'admin' | 'user'`). El **Viewer** público es la ausencia de sesión; su acceso se resuelve con políticas RLS de lectura abierta sobre `series`.
- **Géneros:** tabla `genres` en Supabase (catálogo único), migrando el catálogo que hoy vive en `localStorage` (`tv-shows:custom-genres`). Relación serie↔género como tabla puente N:M (coherente con el conteo "una serie con N géneros cuenta N veces" del dashboard).
- **Imágenes/portadas:** bucket de Storage `covers`. En BD se guarda el **path**, no el binario. Las imágenes a migrar son los **Blobs de IndexedDB** (portadas pegadas vía `ClipboardEvent`), no los assets de la landing (`src/assets/*`), que se quedan en el repo.
- **Fuente de la migración:** los datos buenos viven en la **IndexedDB del navegador** (no en `seed.json`), porque incluyen altas/ediciones hechas desde la app. Por eso F2 requiere un paso previo de **exportación desde el navegador**.
- **Estrategia de transición:** flag `VITE_DATA_BACKEND=mock|supabase`. Mientras dura la migración, los servicios tienen doble implementación y se conmutan por env var; el mock sobrevive hasta F6. Así la app nunca queda rota entre fases.
- **Dexie / IndexedDB:** se retira en F6. Sin capa offline en esta fase.

### Decisiones señaladas (a confirmar al llegar a su fase)

- **F2 — autoría de las series migradas:** todas se asignan a `created_by = <uid del admin real>`. No se preserva la autoría de los usuarios del seed (que no se migran; se crean cuentas reales nuevas).
- **F4 — creación de usuarios desde el panel Admin:** en Supabase, crear usuarios desde el cliente exige `service_role`, que no puede ir en el navegador. Propuesta: Edge Function `admin-create-user` que valida que el llamante es admin y usa `service_role`. Alternativa Fase 1: gestionar usuarios solo por script/dashboard.

---

## Orden y dependencias

`F0 Provisión → F1 Esquema+RLS+Storage → F2 Export+Migración → F3 Servicios → F4 Auth → F5 Storage en CRUD → F6 Retirada Dexie → (F7 opcional: keep-alive + deploy)`

F3, F4 y F5 dependen de F1/F2 pero son en buena medida independientes entre sí (tocan áreas distintas: lectura, sesión, escritura de imágenes). F7 es opcional y desacoplada.

---

## F0 — Provisión del proyecto y entorno local · Complejidad: S

- **Objetivo:** proyecto Supabase operativo y cliente inicializado, **sin tocar la lógica de la app**.
- **Entregable:** proyecto creado en EU, CLI enlazada, `supabase-js` instalado, cliente singleton importable, `.env` configurado; `pnpm dev`/`build`/`lint`/`test:run` siguen en verde.
- **Estado:** ✅ Completada.
- **Dependencias:** ninguna.

### Tareas
1. Crear proyecto en Supabase (región EU). Anotar Project URL, `anon` key y `service_role` key.
2. Instalar dependencias: `pnpm add @supabase/supabase-js`. CLI como dev dep (`pnpm add -D supabase`) o vía gestor del sistema.
3. `supabase init` (crea `supabase/config.toml`) y `supabase link --project-ref <ref>`.
4. `.env.local` con `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Añadir `.env.local` a `.gitignore`. Crear `.env.example` con las claves sin valores.
5. Cliente singleton en `src/lib/supabase.ts` (`createClient` con URL + anon key).

### Archivos
- `src/lib/supabase.ts`
- `supabase/` (resultado de `init`)
- `.env.local`, `.env.example`, `.gitignore` (modificar)
- `package.json` (deps)

### Tests
- Smoke: el cliente se importa sin romper el arranque. Aún no se consume.

### Hecho cuando
- `supabase status` / `supabase db pull` responden contra el proyecto enlazado, el cliente es importable y la app compila y pasa tests sin cambios de comportamiento.

---

## F1 — Esquema + RLS + Storage (migraciones) · Complejidad: M

- **Objetivo:** modelo de datos en Postgres con RLS desde la primera migración y bucket de portadas; tipos TS generados.
- **Entregable:** migración inicial aplicada (tablas + políticas + bucket) y `database.types.ts` generado.
- **Estado:** ✅ Completada.
- **Dependencias:** F0.

### Tareas
1. Migración inicial (`supabase migration new init_schema`):
   - **`profiles`**: `id uuid PK references auth.users(id) on delete cascade`, `email text`, `role text check (role in ('admin','user')) default 'user'`, `created_at timestamptz default now()`.
   - **`genres`**: `id uuid default gen_random_uuid() PK`, `name text not null`, índice único case-insensitive sobre `name` (p. ej. `unique (lower(name))`).
   - **`series`**: `id uuid default gen_random_uuid() PK`, `title text not null`, `synopsis text default ''`, `seasons text not null`, `year int`, `rating int check (rating between 0 and 5)`, `opinion text`, `cover_image_path text`, `created_by uuid references profiles(id)`, `created_at`/`updated_at timestamptz`.
   - **`series_genres`** (puente N:M): `series_id uuid references series(id) on delete cascade`, `genre_id uuid references genres(id) on delete cascade`, PK compuesta.
   - Helper de rol: función `is_admin()` (security definer) que lee `profiles.role` para el `auth.uid()` actual, usada en las políticas.
   - **RLS en la misma migración** (regla del proyecto), habilitada en todas las tablas:
     - `series`: `SELECT` público (`using (true)`); `INSERT`/`UPDATE`/`DELETE` solo si `created_by = auth.uid()` o `is_admin()`.
     - `series_genres`: lectura pública; escritura ligada a permiso sobre la serie.
     - `genres`: lectura pública; `INSERT` para autenticados.
     - `profiles`: `SELECT` del propio registro + admin; `UPDATE` del propio + admin.
2. **Storage:** bucket `covers`. Políticas: lectura pública, escritura solo autenticados (y borrado por dueño/admin).
3. (Opcional) Trigger `handle_new_user` que cree el `profile` automáticamente al registrarse, si se quiere signup self-service más adelante.
4. Generar tipos: `supabase gen types typescript --linked > src/types/database.types.ts`.

### Archivos
- `supabase/migrations/<timestamp>_init_schema.sql`
- `src/types/database.types.ts`

### Tests
- `supabase db reset` aplica la migración limpia en local. Verificación manual de que RLS está activa (una query anónima lee series pero no inserta).

### Hecho cuando
- `supabase db reset` corre sin errores, las políticas RLS están activas, el bucket `covers` existe y los tipos están generados y versionados.

---

## F2 — Exportación de IndexedDB + migración de datos · Complejidad: L

- **Objetivo:** trasladar las series y portadas reales del navegador a Supabase, y crear los usuarios reales.
- **Entregable:** utilidad dev de export que produce un JSON autocontenido; script Node que importa series, sube portadas a Storage y crea usuarios + profiles.
- **Estado:** ✅ Completada.
- **Dependencias:** F1 (el import necesita el schema; el export puede prepararse en paralelo).

### Tareas
1. **Export (navegador), solo DEV:**
   - Utilidad gateada con `import.meta.env.DEV` (ruta `/export` o botón en el showcase, mismo patrón que `/showcase`).
   - Lee todas las series de Dexie y resuelve cada portada (`imageId → Blob`) vía `imageService`.
   - Convierte cada Blob a dataURL base64 con `FileReader`.
   - Descarga un único `tvshows-export.json`: `{ series: [{ ...campos, genres: string[], coverImageBase64: string | null, coverMime: string | null }] }`.
   - **Sin librerías nuevas** (Blob, FileReader, URL, ancla de descarga).
2. **Import (Node, `service_role`):** script `scripts/migrate-to-supabase.ts` (ejecutable con `tsx`):
   - Crea los usuarios reales con `auth.admin.createUser({ email, password, email_confirm: true })`. Lista de usuarios y passwords iniciales tomada de variables de entorno, **nunca hardcodeada**. Inserta su fila en `profiles` con el `role`.
   - Inserta en `genres` los nombres únicos (de los `genres` de las series + catálogo de `localStorage` si se aporta), normalizados (trim, sin duplicados case-insensitive).
   - Por cada serie: decodifica base64 → `Buffer` → sube a `covers/<seriesId>.<ext>` → inserta fila en `series` con `cover_image_path` y `created_by = <adminUid>` → inserta filas en `series_genres`.
   - **Idempotente:** re-ejecutable sin duplicar (upsert por id o limpieza previa controlada por flag).
3. Verificación: recuentos por tabla + inspección del bucket en el dashboard de Supabase.

### Archivos
- `src/pages/ExportPage/` (o utilidad equivalente, DEV only)
- `scripts/migrate-to-supabase.ts`
- `scripts/README.md` (cómo ejecutar: variables, orden, dry-run)

### Tests
- Test puro de la función `base64ToBuffer` / parseo de dataURL (sin tocar red).
- El script registra un resumen (series insertadas, imágenes subidas, usuarios creados) a modo de verificación; no requiere unit tests de integración.

### Hecho cuando
- En el dashboard de Supabase ves todas tus series con sus géneros, las portadas en el bucket `covers`, y los usuarios reales creados con su `profile` y rol.

---

## F3 — Capa de servicios contra Supabase (flag dual) · Complejidad: L

- **Objetivo:** que la app lea/escriba contra Supabase sin romper el mock.
- **Entregable:** implementación Supabase de los servicios detrás de la interfaz actual, conmutable por `VITE_DATA_BACKEND`.
- **Estado:** ✅ Completada.
- **Dependencias:** F1, F2 (necesita datos reales para validar).

### Tareas
1. Extraer/confirmar el **contrato TS** de cada servicio (`SeriesService`, `UsersService`, `ImageService`, catálogo de `genres`) en `services/types.ts`. Es la pieza que hace intercambiable el backend (principio ya documentado en el proyecto).
2. Implementaciones `*.supabase.ts`:
   - `seriesService`: `getAll` (con join a `genres` vía `series_genres`), `getById`, `create`, `update`, `remove`.
   - `usersService`: `getAll`, `getById` (desde `profiles`).
   - `imageService`: `getUrl(path)`, `save(file)`, `remove(path)` contra Storage.
   - `genresService`: `getAll`, `add`.
   - **Capa de mapeo** snake_case (BD) ↔ camelCase (app), aislada para no filtrar nombres de columnas a los componentes.
3. Selector en `services/index.ts` que elige mock vs supabase según `import.meta.env.VITE_DATA_BACKEND`.
4. Ajustar hooks solo si cambia el shape (idealmente nada, gracias al mapeo).

### Archivos
- `src/services/types.ts`
- `src/services/{series,users,image,genres}Service.supabase.ts`
- `src/services/index.ts` (selector)
- Mapeadores en `src/services/mappers/`

### Tests
- Tests de cada servicio Supabase con el cliente mockeado (patrón `vi.hoisted` ya usado en el proyecto). Verificar que cumplen el contrato.

### Hecho cuando
- Con `VITE_DATA_BACKEND=supabase`, listado y detalle muestran datos de Supabase. Con `mock`, todo sigue igual que antes.

---

## F4 — Auth real con Supabase Auth · Complejidad: L

- **Objetivo:** sesión y roles reales gestionados por Supabase.
- **Entregable:** login/logout reales, sesión persistida por `supabase-js`, roles desde `profiles`, `ProtectedRoute` operativo.
- **Estado:** ✅ Completada.
- **Dependencias:** F1 (profiles), F2 (usuarios), F3 (servicios).

### Tareas
1. Reescribir `authService` sobre `supabase.auth` (`signInWithPassword`, `signOut`, `getSession`, `onAuthStateChange`).
2. `AuthContext`: suscripción a `onAuthStateChange`, carga del `profile` (rol) tras login, expone `{ user, role, login, logout, loading }`.
3. **Eliminar `utils/hashPassword.ts`** (SubtleCrypto): las passwords las gestiona Supabase.
4. `ProtectedRoute`: filtra por el `role` de `profiles`.
5. `LoginForm`/`LoginModal`: mismo UI, ahora contra Supabase; manejo de errores reales (credenciales inválidas, etc.).
6. Gestión de usuarios del Admin (tu antiguo H6) — ver decisión señalada: Edge Function `admin-create-user` (valida admin + usa `service_role`) **pospuesta**. En su lugar, gestión por dashboard de Supabase o por script: `scripts/create-user.ts` (crea usuario Auth + `profile` con rol, idempotente). Borrado: por dashboard (ojo FK `series.created_by` sin cascade → bloquea si el usuario tiene series).

### Archivos
- `src/services/authService.supabase.ts`
- `src/context/AuthContext.tsx` (reescrito)
- `src/components/layout/ProtectedRoute/`
- Borrar `src/utils/hashPassword.ts`
- (Opcional) `supabase/functions/admin-create-user/`

### Tests
- Login OK/KO, sesión persiste (mock de `supabase.auth`), `ProtectedRoute` por rol, logout limpia sesión.

### Hecho cuando
- Te logueas con un email real, recargas y sigues logueado, logout limpia la sesión, y las rutas por rol se comportan correctamente para admin/user/viewer.

---

## F5 — Storage de portadas en el CRUD · Complejidad: M

- **Objetivo:** que crear/editar serie suba la portada a Storage.
- **Entregable:** el `SeriesForm` sube la imagen a Storage y guarda el path; listado y detalle la consumen.
- **Estado:** ✅ Completada.
- **Dependencias:** F1 (bucket), F3 (servicios).

### Tareas
1. `imageService.supabase`: `save(file)` (sube a `covers`, devuelve path), `remove(path)`, `getUrl(path)`.
2. `SeriesForm`: el `File` validado (input file **o** paste `ClipboardEvent`, reutilizando `processImageFile` de H11) se sube a Storage en submit; se guarda `cover_image_path`. Revocar el `ObjectURL` local tras subir.
3. Edición: si cambia la portada, subir la nueva y borrar la anterior; si no cambia, conservar el path.
4. Consumo: `SeriesCard`, `SeriesRow` y `SeriesDetailPage` resuelven `cover_image_path` → URL para el `<img>`.
5. Borrado de serie: borra también el objeto en Storage.

### Archivos
- `src/services/imageService.supabase.ts`
- `src/components/features/SeriesForm/`
- `src/components/features/{SeriesCard,SeriesRow}/`, `src/pages/SeriesDetailPage/`

### Tests
- `save`/`remove` con cliente mockeado; el form sube en create y update; el borrado limpia Storage.

### Hecho cuando
- Creas una serie pegando una imagen, se guarda en Storage y se ve en listado y detalle; al borrar la serie, su portada desaparece del bucket.

---

## F6 — Retirada de Dexie y limpieza · Complejidad: M

- **Objetivo:** app 100% sobre Supabase, sin IndexedDB ni flag dual.
- **Entregable:** eliminados Dexie, seed local, mocks y el selector de backend; suite en verde.
- **Estado:** ✅ Completada.
- **Dependencias:** F3, F4, F5.

### Tareas
1. Eliminar `src/db/` (`database.ts`, `seed.ts`, `seed.json`, `migrateSeasons.*` si ya no aplica) y la dependencia `dexie`.
2. Eliminar las implementaciones mock de los servicios y el flag `VITE_DATA_BACKEND` (dejar solo Supabase).
3. Decidir sobre la utilidad de export de F2: borrarla o conservarla gateada en DEV.
4. Limpiar usos de `localStorage` salvo preferencias de UI (tema, view-mode).
5. Actualizar/eliminar los tests que dependían de mocks o Dexie.
6. Barrido de imports muertos; `lint`, `tsc -b`, `build` y `test:run` limpios.

### Archivos
- Borrados en `src/db/` y `src/services/*` (mocks); ajustes transversales de tests.

### Tests
- Suite completa adaptada y en verde, sin referencias a IndexedDB.

### Hecho cuando
- No queda rastro de Dexie/IndexedDB, la app funciona solo con Supabase y `lint`/`tsc`/`build`/`test` pasan limpios.

---

## F7 (opcional) — Keep-alive anti-pausa + deploy · Complejidad: S

- **Objetivo:** evitar la pausa del free tier por inactividad y, si se desea, publicar la app.
- **Estado:** 🟡 Heartbeat ✅ completado (2026-06-27); backups periódicos y deploy ⬜ pendientes (fase aparte).
- **Dependencias:** F1. Independiente del resto.

### Tareas
1. **Heartbeat:** ✅ Hecho. Migración `20260626233407_heartbeat.sql` (tabla `heartbeat` de fila única + `last_ping`, RLS sin policies → solo `service_role` escribe), script `scripts/heartbeat.ts` (upsert), workflow `.github/workflows/heartbeat.yml` (cron `0 6 */3 * *` + `workflow_dispatch`). Secrets `VITE_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en el repo. Verificado con un run manual en verde; el `schedule` corre solo cada 3 días en la rama por defecto (`main`).
2. **Backups propios:** ⬜ Pendiente — programar un export/backup periódico (el free tier no trae backups automáticos). De momento, backups manuales.
3. **Deploy (opcional):** ⬜ Pendiente — publicar el SPA (Vercel/Netlify/Cloudflare Pages) con sus variables de entorno.

### Hecho cuando
- El proyecto no se pausa por inactividad (✅ heartbeat) y existe al menos un backup recuperable (⬜ pendiente).

---

## Tabla resumen de dependencias

| Fase | Depende de | Complejidad |
|---|---|---|
| F0 Provisión + entorno | — | S |
| F1 Esquema + RLS + Storage | F0 | M |
| F2 Export + migración de datos | F1 | L |
| F3 Capa de servicios Supabase | F1, F2 | L |
| F4 Auth real | F1, F2, F3 | L |
| F5 Storage de portadas en CRUD | F1, F3 | M |
| F6 Retirada de Dexie | F3, F4, F5 | M |
| F7 Keep-alive + deploy (opcional) | F1 | S |

> F3, F4 y F5 tocan áreas distintas (lectura, sesión, escritura de imágenes) y pueden abordarse en sesiones separadas una vez F1/F2 están hechas. F6 cierra la migración. F7 es independiente y puede hacerse en cuanto exista el proyecto.

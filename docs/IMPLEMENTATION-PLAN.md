# Plan de implementación — Fase 1: TV Shows Manager

> Plan incremental por hitos verticales para implementar la Fase 1 descrita en `docs/PRD-Phase-1.md`.
> Cada hito entrega una porción funcional end-to-end (UI + lógica + persistencia + tests).

---

## Decisiones de proyecto (parametrización del plan)

Acordadas antes de empezar:

- **Versiones libs:** React 19, React Router 6.28, Dexie 4, RHF 7.54, Zod 3.24, Recharts 2.15, Vitest 2.1, Vite 6, TS 5.7 (las del `package.json` ya escrito).
- **Lint:** ESLint sí. Sin Husky / lint-staged.
- **Tests Dexie:** decisión sobre `fake-indexeddb` aplazada a H2.
- **Passwords (Fase 1):** SHA-256 con SubtleCrypto (no texto plano).
- **Filtros del listado:** estado en URL querystring.
- **UUIDs:** `crypto.randomUUID()` nativo, sin librería.
- **Ruta `/showcase`:** solo en dev (`import.meta.env.DEV`), fuera del bundle de producción.

---

## Ajustes al orden propuesto en la consigna (justificación)

1. **Renombro el orden temporal.** El "Hito 1: Setup" pasa a **H0** y el "Hito 0 visual" pasa a **H1**. Numerar al revés del orden real es confuso.
2. **Fusiono "capa de datos" con el primer hito funcional (listado/detalle).** Un hito que solo sea Dexie + servicios + seed sin UI es exactamente un hito horizontal (viola la regla 1). Lo mínimo de la capa de datos se entrega junto con la primera UI que la consume. El resto (imageService completo, índices adicionales, etc.) se añade cuando un hito posterior lo necesita.
3. **Adelanto auth antes del CRUD de series.** `Series.createdBy` apunta a un user. Si se hace CRUD primero, hay que hardcodear `createdBy` y refactorizar después. Hacerlo al revés evita ese estado intermedio incoherente. El listado/detalle público no se ve afectado.

**Orden final:**
`H0 Setup → H1 Visual/UI kit/showcase → H2 Datos + Listado + Detalle → H3 Auth → H4 CRUD series → H5 Dashboard → H6 Users → H7 Pulido`.

---

## H0 — Setup base · Complejidad: S ✅

- **Objetivo:** Proyecto compilando, dev server arrancando, tests en verde.
- **Entregable:** `pnpm dev` muestra Hello World; `pnpm test:run` y `pnpm build` pasan.
- **Tareas:**
  1. Confirmar versiones del `package.json` actual.
  2. `pnpm install`.
  3. Añadir ESLint (typescript-eslint + react-hooks + react-refresh) y script `lint`.
- **Archivos:** ya creados durante el scaffolding; añadir `eslint.config.js`.
- **Tests:** smoke test de `App.tsx`.
- **Hecho cuando:** `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm test:run` pasan limpios.
- **Estado:** ✅ Completado.
- **Dependencias:** ninguna.

### Notas de implementación

**Config de Vitest separada del config de Vite**
El plan original asumía un único `vite.config.ts` con `/// <reference types="vitest" />` para añadir la propiedad `test`. En Vitest 2.x ese triple-slash reference ya no augmenta los tipos de Vite, y usar `import { defineConfig } from 'vitest/config'` genera un conflicto de tipos con el vite@6 del proyecto (vitest@2 tiene vite@5 como peer). Solución adoptada: `vite.config.ts` solo contiene config de Vite; `vitest.config.ts` importa desde `vitest/config` y extiende via `mergeConfig`. `tsconfig.node.json` actualizado para incluir ambos archivos.

**SASS modern-compiler**
Sass 1.83 emite un warning sobre el uso de la Legacy JS API por parte de Vite. Se ha configurado `css.preprocessorOptions.scss.api: 'modern-compiler'` en `vite.config.ts` para eliminarlo sin cambiar de versión.

**React Router future flags**
React Router 6.28 advierte sobre dos cambios de comportamiento de v7 (`v7_startTransition`, `v7_relativeSplatPath`). Se han activado ambos flags en `BrowserRouter` (main.tsx) y `MemoryRouter` (App.test.tsx) para limpiar la salida de tests y alinear el comportamiento con v7 desde ya.

---

## H1 — Sistema visual, UI kit y showcase · Complejidad: L ✅

- **Objetivo:** Lock visual completo antes de tocar lógica de negocio.
- **Entregable:** ruta `/showcase` (solo en dev) con todos los componentes UI, los 8 combos de tema cambiables en vivo y mockups estáticos de pantallas clave.
- **Tareas:**
  1. Tokens semánticos completos:
     - Colores: `--color-{bg,surface,text,text-muted,primary,primary-contrast,border,danger,success,warning}`.
     - Sombras: `--shadow-{sm,md}`.
     - Radios: `--radius-{sm,md,lg}`.
     - Espaciado: `--space-{1..8}`.
     - Tipografía: `--font-*`.
  2. Definir los 4 temas (`default`, `ocean`, `sunset`, `forest`) × 2 modos (`light`, `dark`) en `styles/themes/` con selector compuesto `[data-theme][data-mode]`.
  3. `ThemeContext` con `{ theme, mode, setTheme, setMode, toggleMode }`. Persistencia en `localStorage`. Primer render respeta `prefers-color-scheme` para el modo.
  4. Layout: `Header` (logo + nav + selector tema/modo + botón login mock), `Layout` con `<Outlet/>`, navegación responsive (hamburguesa < 768px).
  5. UI primitives en `components/ui/` (sin lógica de negocio):
     - `Button` (variantes: primary/secondary/ghost/danger × tamaños sm/md/lg).
     - `Input`, `Textarea`.
     - `Select` (single + multi).
     - `Tag`/`Chip`.
     - `Card`.
     - `Modal`, `ConfirmDialog`.
     - `Rating` (estrellas 1-5, modo read y modo input).
     - `IconButton`.
     - `FormField` (wrapper label + error).
     - `Spinner`.
     - `Avatar`/`ImagePlaceholder`.
  6. `ShowcasePage`: pinta todas las primitives, los 8 combos de tema cambiables en vivo, y mockups estáticos con datos inline de:
     - SeriesCard mock.
     - Fila del listado.
     - Formulario completo renderizado.
     - KPI card del dashboard.
     - Gráfico Recharts con datos dummy.
     - **Importante:** los mockups viven en `pages/ShowcasePage/` con datos hardcoded, NO en `components/features/` — son scaffolding visual, no implementación real.
  7. `constants/messages.ts` con los textos UI necesarios para el showcase.
  8. Ruta `/showcase` registrada únicamente cuando `import.meta.env.DEV` (no llega al bundle de producción).
- **Archivos:**
  - `src/styles/themes/*.scss` (un archivo por tema o índice central).
  - `src/context/ThemeContext.tsx`.
  - `src/hooks/useTheme.ts`.
  - `src/components/ui/<Componente>/` (uno por primitive con `.tsx`, `.module.scss`, `.test.tsx`).
  - `src/components/layout/{Header,Layout}/`.
  - `src/pages/ShowcasePage/`.
  - `src/constants/messages.ts`.
  - Modificar `src/App.tsx` para registrar rutas y `<Layout>`.
- **Tests:**
  - Test unitario por cada UI primitive (render + interacción mínima).
  - Test de `ThemeContext`: cambio de tema persiste en localStorage, primer render respeta `prefers-color-scheme`.
- **Hecho cuando:** puedes recorrer `/showcase`, cambiar los 8 combos sin recarga, y validar visualmente cards, listado, formulario, KPI y gráfico.
- **Estado:** ✅ Completado.
- **Dependencias:** H0.

### Notas de implementación

**ThemeContext separado en dos archivos**
`react-refresh` advierte cuando un archivo exporta a la vez un componente y un valor no-componente. Para eliminar el warning, el contexto (`ThemeContext`) vive en `context/themeContextInstance.ts` (solo crea y exporta el `createContext`) y el proveedor (`ThemeProvider`) en `context/ThemeContext.tsx`. El barrel `context/index.ts` re-exporta ambos, por lo que los consumidores no notan el cambio.

**`window.matchMedia` mockeado globalmente en setup.ts**
jsdom no implementa `matchMedia`. Se añadió un mock por defecto (siempre `matches: false`, equivalente a modo light) en `src/test/setup.ts` para que todos los tests que inicialicen `ThemeContext` no exploten. Los tests que necesiten verificar comportamiento dark pueden sobreescribir el mock localmente con `Object.defineProperty`.

**CSS modules y `display: none` en tests responsive**
Con `css: true` en la config de Vitest, jsdom inyecta las hojas de estilo reales y computa `display: none`. Los elementos ocultos por media queries (nav en mobile, controles de tema) no aparecen en el árbol accesible de RTL. Solución adoptada: los tests que verifican la existencia de esos elementos usan `{ hidden: true }` en `getByRole`. Los tests de comportamiento (hamburguesa abre menú) siguen funcionando sobre elementos visibles.

**`toHaveClass` incompatible con CSS modules**
`toHaveClass('hoverable')` falla porque CSS modules transforma el nombre a `_hoverable_<hash>`. Se usa `expect(el.className).toMatch(/hoverable/)` en su lugar. Criterio general para este proyecto: no testear nombres de clase concretos de CSS modules, solo comportamiento o presencia de substring.

**Separación entre temas en un único `_tokens.scss`**
El plan mencionaba "un archivo por tema o índice central". Se optó por un único `_tokens.scss` con todos los selectores `[data-theme][data-mode]`. El archivo tiene ~130 líneas pero es autocontenido y fácil de mantener; añadir un quinto tema es añadir un bloque. Si crece se puede partir en un archivo por tema sin tocar ningún consumidor.

**`App.module.scss` eliminado**
El archivo de estilos del scaffolding (`.app { place-items: center }`) era incompatible con el layout real. Se eliminó y el centrado lo gestiona el propio `Layout.module.scss`.

---

## H2 — Capa de datos + Listado + Detalle (read-only) · Complejidad: L ✅

- **Objetivo:** Ver series reales persistidas, con filtros y búsqueda. Sin login.
- **Entregable:** rutas `/series` y `/series/:id` funcionales consumiendo IndexedDB. Seed inicial poblado al primer arranque.
- **Estado:** ✅ Completado.
- **Tareas:**
  1. Tipos en `types/`: `Series`, `Genre`, `User`.
  2. Schema Dexie v1 con tablas: `series`, `users`, `images` (Blob).
  3. Seed inicial: detecta BD vacía y carga:
     - 2 users (admin `admin@local` / `admin`, user `user@local` / `user`) con password hasheada con SHA-256.
     - 5–10 series de ejemplo con imágenes placeholder (Blobs guardados en `images`).
  4. Servicios (parcial — solo lectura):
     - `seriesService.getAll`, `seriesService.getById`.
     - `imageService.get(id) → Blob`.
  5. Hooks: `useSeries` (lista completa), `useSeriesById(id)`.
  6. `SeriesListPage`:
     - Grid responsivo (1 col móvil, 2 tablet, 3-4 desktop).
     - Filtro por género (multi-select).
     - Filtro por rating.
     - Búsqueda por título.
     - Estado de filtros en URL querystring.
  7. `SeriesDetailPage`:
     - Render completo del modelo `Series` (portada, título, año, rating en estrellas, géneros, sinopsis, reparto, opinión, temporadas).
     - Sin botones de acción (no hay sesión todavía).
  8. Reemplazar el mockup de SeriesCard del showcase por el componente real en `features/SeriesCard/` (el showcase pasa a importarlo desde features).
  9. Decidir si se añade `fake-indexeddb` para tests (decisión aplazada hasta este punto).
- **Archivos:**
  - `src/types/{series,user,genre}.ts`.
  - `src/db/database.ts` (ampliar el skeleton existente), `src/db/seed.ts`.
  - `src/services/seriesService.ts`, `src/services/imageService.ts`.
  - `src/hooks/{useSeries,useSeriesById}.ts`.
  - `src/components/features/SeriesCard/`.
  - `src/pages/SeriesListPage/`, `src/pages/SeriesDetailPage/`.
  - Rutas en `App.tsx`.
- **Tests:**
  - Servicios contra Dexie real (con `fake-indexeddb` si se aprueba en este hito).
  - Hooks con `renderHook`.
  - `SeriesListPage`: filtros funcionan, búsqueda funciona, sincronización con URL.
  - `SeriesDetailPage`: render del modelo, manejo de id inexistente.
- **Hecho cuando:** abres la app sin login, navegas listado → detalle, aplicas filtros y búsqueda, recargas y todo persiste.
- **Dependencias:** H1.

### Notas de implementación

**`fake-indexeddb` descartado — mocks manuales con `vi.hoisted`**
Se decidió no instalar `fake-indexeddb`. Los tests de servicios usan `vi.mock` con factory. Para que el mock esté disponible antes del import del módulo bajo test (Vitest hace hoisting de `vi.mock`), el objeto mock se declara con `vi.hoisted()` en lugar de un literal de variable. Sin `vi.hoisted`, el mock se ejecuta antes de que la variable esté inicializada y los tests aparecen como 0.

**`setLoading(true)` síncrono en effects — patrón correcto**
`eslint-plugin-react-hooks` prohibe llamar `setState` síncronamente dentro del cuerpo de un `useEffect`. Patrón adoptado en `useSeries` y `useSeriesById`: el estado inicial es `loading: true` (desde `useState(true)`); el efecto solo llama `setState` dentro de los callbacks `.then`/`.catch`. El reset de loading en reload se hace en la función `reload()` (fuera del effect), no dentro de él.

**`react-hooks/set-state-in-effect` ya activo en el proyecto**
La regla está habilitada vía `eslint-plugin-react-hooks`. Es más estricta que el default de CRA; rechaza cualquier `setState` síncrono al inicio del efecto aunque sea un reset de loading.

---

## H3 — Auth, roles y rutas protegidas · Complejidad: M ✅

- **Estado:** ✅ Completado.
- **Objetivo:** Login funcional con sesión persistida y guard de rutas.
- **Entregable:** botón login en header, formulario en `/login`, redirección post-login, `<ProtectedRoute>` operativo filtrando por rol.
- **Tareas:**
  1. `authService.login/logout/getCurrentUser` contra Dexie. Password hash con SHA-256 vía SubtleCrypto.
  2. `AuthContext` con `{ user, login, logout }`. Sesión persistida en `localStorage` (solo id de user, no password).
  3. `usersService.getAll/getById` (suficiente para login; CRUD completo en H6).
  4. `hooks/useAuth`.
  5. `components/layout/ProtectedRoute` con prop `roles?: Role[]`. Redirige a `/login` o `/series` según caso.
  6. `pages/LoginPage` con React Hook Form + Zod (schema con email válido + password no vacío).
  7. Header: muestra email/rol cuando hay sesión, botón logout. Sustituye el botón login mock del H1.
  8. `SeriesDetailPage`: ahora sí muestra/oculta botones editar/eliminar según permisos (las acciones aún no hacen nada — se preparan para H4).
- **Archivos:**
  - `src/services/authService.ts`, `src/services/usersService.ts`.
  - `src/context/AuthContext.tsx`.
  - `src/hooks/useAuth.ts`.
  - `src/components/layout/ProtectedRoute/`.
  - `src/pages/LoginPage/`.
  - Modificar `src/components/layout/Header/` y `src/pages/SeriesDetailPage/`.
  - Utility `src/utils/hashPassword.ts` (SubtleCrypto wrapper).
- **Tests:**
  - `authService`: login OK, login KO (credenciales malas), logout, getCurrentUser.
  - `ProtectedRoute`: matriz 3 roles × rutas permitidas / denegadas.
  - `LoginPage`: validación de form, error de credenciales, redirección post-login.
  - `useAuth`: lectura/escritura de sesión.
  - `hashPassword`: determinismo (mismo input → mismo hash) y mismatch (inputs distintos → hashes distintos).
- **Hecho cuando:** te logueas como admin o user, recargas y sigues logueado, logout funciona, una ruta restringida redirige a Viewer.
- **Dependencias:** H2.

### Notas de implementación

**Mismo patrón de doble archivo que ThemeContext**
`AuthContext` sigue el patrón `authContextInstance.ts` (solo `createContext` + tipo `AuthContextValue`) + `AuthContext.tsx` (proveedor). Evita el warning de `react-refresh` al mezclar contexto y componente en el mismo archivo.

**Sesión en localStorage con clave `tv-shows:session`**
Solo se almacena `{ userId: string }`. Al iniciar, `AuthProvider` llama `authService.getCurrentUser()` para verificar que el userId sigue existiendo en Dexie antes de restaurar la sesión.

**Mock de `useAuth` en tests de componentes que dependen del Header**
`Header`, `Layout`, `SeriesDetailPage` y `App` ahora usan `useAuth`. Los tests de estos componentes mockean `@/hooks` con `useAuth: vi.fn(() => {...})`. `App.test.tsx` también mockea `authService.getCurrentUser` para evitar que `AuthProvider` haga llamadas a Dexie al montar.

**Warning de `act()` en App.test.tsx**
`AuthProvider` tiene un `useEffect` que resuelve una Promise async, lo que actualiza estado fuera del ciclo síncrono del test. El warning es cosmético — los tests pasan. La Promise no afecta al output renderizado porque los componentes que consumen auth están mockeados vía `useAuth`.

**Emails con TLD en tests de LoginPage**
Zod 3.x requiere TLD en el validador de email. Los tests usan `test@example.com` en lugar de `admin@local`.

---

## H4 — CRUD de series · Complejidad: L ✅

- **Estado:** ✅ Completado.
- **Objetivo:** Crear, editar y eliminar series respetando permisos.
- **Entregable:** rutas `/series/new` y `/series/:id/edit` operativas; eliminar desde detalle con confirmación.
- **Tareas:**
  1. Ampliar `seriesService` con `create`, `update`, `remove`. Añadir `imageService.save(blob) → id`, `imageService.remove(id)`.
  2. Schema Zod compartido en `utils/seriesSchema.ts` con todas las validaciones del PRD §5.3:
     - `title`, `synopsis`, `seasons`, `year`, `rating`, `genres`, `coverImage`: requeridos.
     - `cast`: opcional, pero si se rellena debe ser array no vacío.
     - `opinion`: opcional.
     - `rating`: entero entre 1 y 5.
     - `year`: entero entre 1900 y año actual.
     - `seasons`: entero positivo.
     - `coverImage`: MIME ∈ {jpeg, png, webp} + tamaño ≤ 2 MB.
  3. `SeriesForm` (`features/SeriesForm/`): RHF + `zodResolver`, file input con preview, multi-select de géneros, chips de cast (añadir/quitar).
  4. `SeriesFormPage` que monta el form en modo crear o editar (lee `:id` si existe).
  5. Eliminar en `SeriesDetailPage` usando `ConfirmDialog`.
  6. Reglas de permiso centralizadas en `utils/permissions.ts` (`canEditSeries(user, series)`, `canDeleteSeries(user, series)`, `canCreateSeries(user)`).
  7. `createdBy` se rellena desde `useAuth().user.id`.
- **Archivos:**
  - Ampliar `src/services/seriesService.ts`, `src/services/imageService.ts`.
  - `src/utils/seriesSchema.ts`, `src/utils/permissions.ts`.
  - `src/components/features/SeriesForm/`.
  - `src/pages/SeriesFormPage/`.
  - Modificar `src/pages/SeriesDetailPage/` para acción eliminar.
- **Tests:**
  - Schema Zod: cubrir cada regla (válido + inválido).
  - `SeriesForm`: submit válido, submit inválido muestra errores, modo edición precarga datos.
  - `permissions`: matriz roles × acciones.
  - Integración eliminar: confirmación + borrado + redirección.
  - `imageService`: round-trip Blob → id → Blob.
- **Hecho cuando:** flujo completo crear → ver en listado → editar → eliminar funciona para User (solo las suyas) y Admin (todas).
- **Dependencias:** H3.

### Notas de implementación

**Preview de imagen sin `setState` síncrono en effect**
El linter (`react-hooks/set-state-in-effect`) rechaza cualquier `setState` síncrono dentro del cuerpo de un `useEffect`. Para el preview de la imagen seleccionada (operación síncrona con `URL.createObjectURL`) se optó por manejar la URL directamente en el handler `handleFileChange`: se revoca la URL anterior vía `useRef`, se crea la nueva y se llama `setImagePreview` fuera de cualquier effect. Un `useEffect` de limpieza sin cuerpo se encarga de revocar la URL al desmontar. Para la imagen existente en modo edición (carga async desde `imageService.get`) se sigue el patrón establecido en H2/H3: `setState` dentro del callback `.then`.

**`selectedOptions` no asignable en jsdom — usar `userEvent.selectOptions`**
`fireEvent.change(select, { target: { selectedOptions: [...] } })` falla en jsdom porque `selectedOptions` es una propiedad de solo lectura. Para simular selección múltiple en el `<select>` de géneros se usa `userEvent.selectOptions(element, ['Drama'])`, que manipula el DOM de forma compatible con jsdom.

**SeriesFormPage mocka `SeriesForm` en sus tests**
Los tests de `SeriesFormPage` mockean el componente `SeriesForm` completo para aislar la lógica de la página (carga de datos, llamadas a servicios, navegación) del comportamiento del formulario. Los tests del formulario en sí viven en `SeriesForm.test.tsx`.

**Permisos en capa de página, no en ProtectedRoute**
`ProtectedRoute` solo valida que el usuario tenga rol `user` o `admin`. La comprobación de propiedad (User solo puede editar sus series) se hace en `SeriesFormPage` llamando a `canEditSeries(user, series)`, coherente con cómo `SeriesDetailPage` muestra/oculta los botones de acción.

---

## H5 — Dashboard · Complejidad: M ✅

- **Estado:** ✅ Completado.
- **Objetivo:** 4 métricas en vivo.
- **Entregable:** ruta `/dashboard` con los 4 widgets, reactivo a cambios en la BD.
- **Tareas:**
  1. `hooks/useDashboardMetrics` calcula las 4 métricas a partir de `useSeries`:
     - Total de series (KPI numérico).
     - Series destacadas: count con `rating >= 4` (KPI numérico).
     - Distribución por género (una serie con N géneros cuenta N veces).
     - Distribución por rating (count por valor 1..5).
  2. Componentes en `features/dashboard/`: `KPICard`, `GenreDistributionChart`, `RatingDistributionChart`.
  3. Recharts consumiendo colores del tema activo (vía `getComputedStyle` sobre los CSS vars o pasando tokens explícitos desde JS).
  4. `pages/DashboardPage` componiendo los 4 widgets.
- **Archivos:**
  - `src/hooks/useDashboardMetrics.ts`.
  - `src/components/features/dashboard/{KPICard,GenreDistributionChart,RatingDistributionChart}/`.
  - `src/pages/DashboardPage/`.
- **Tests:**
  - `useDashboardMetrics`: función pura sobre datos de prueba, todas las métricas.
  - Render de cada widget con datos de prueba.
- **Hecho cuando:** crear/eliminar una serie actualiza el dashboard al volver; cambiar de tema cambia los colores de los gráficos.
- **Dependencias:** H4 (necesita CRUD para validar reactividad).

---

## H6 — Gestión de usuarios (Admin) · Complejidad: M ✅

- **Estado:** ✅ Completado.
- **Objetivo:** Admin gestiona usuarios.
- **Entregable:** ruta `/users` con listado, crear, editar (rol/password) y eliminar (con guard de no auto-eliminarse).
- **Tareas:**
  1. Ampliar `usersService` con `create`, `update`, `remove`.
  2. Schema Zod para user:
     - `email`: email válido, único en BD.
     - `password`: mínimo definido (a confirmar al llegar al hito).
     - `role`: `'admin' | 'user'`.
  3. `pages/UsersPage` + `features/UserForm` + `features/UserList`.
  4. `ProtectedRoute` con `roles: ['admin']` aplicado a `/users`.
  5. Validación "no puedes eliminarte a ti mismo": tanto en UI (botón deshabilitado + tooltip) como en el servicio (lanza error si `id === currentUser.id`).
- **Archivos:**
  - Ampliar `src/services/usersService.ts`.
  - `src/pages/UsersPage/`.
  - `src/components/features/{UserForm,UserList}/`.
  - `src/utils/userSchema.ts`.
- **Tests:**
  - Schema Zod (válido + inválido, email único).
  - Servicio: email único, no auto-eliminación, hash de password al crear/actualizar.
  - UI: guard visible para auto-eliminación, confirmación de borrado, validaciones.
- **Hecho cuando:** Admin crea un user, ese user puede loguearse y crear series; Admin no puede eliminarse a sí mismo.
- **Dependencias:** H3.

---

## H7 — Pulido, accesibilidad y cobertura · Complejidad: M ✅

- **Estado:** ✅ Completado.
- **Objetivo:** App lista para uso real, todos los criterios de aceptación §12 verificados.
- **Entregable:** los 9 checkboxes de §12 del PRD pasan.
- **Tareas:**
  1. Auditoría a11y:
     - Foco visible en todos los interactivos.
     - Navegación completa por teclado (tab/enter/escape).
     - Roles ARIA correctos en modales, selects, listas.
     - Contraste suficiente en los 8 combos de tema.
     - `aria-live` para feedback de acciones (crear/editar/eliminar).
  2. Página 404 (`*` route).
  3. Estados de carga y error en todas las páginas async (skeletons o spinners, mensajes de error claros).
  4. Revisión responsive en los 3 breakpoints (móvil, tablet, desktop).
  5. Completar cobertura de tests donde falte (guards, hooks, servicios — chequear §9 del PRD).
  6. Limpieza: confirmar que `/showcase` no aparece en producción (gate `import.meta.env.DEV`).
  7. Revisar `constants/messages.ts` para que toda la copy de UI esté centralizada (preparación i18n).
- **Archivos:** transversal — toca todas las áreas.
- **Tests:** los que falten para cubrir §9 del PRD.
- **Hecho cuando:** los 9 criterios de §12 pasan.
- **Dependencias:** H5, H6.

### Notas de implementación

**Bug ConfirmDialog en SeriesDetailPage**
`SeriesDetailPage` pasaba `description`/`onCancel` a `ConfirmDialog`, que espera `message`/`onClose`. TypeScript no lo detectaba (probablemente por el tsBuildInfoFile cacheado). Corregido a los nombres correctos de la interfaz.

**NotFoundPage**
Componente nuevo en `src/pages/NotFoundPage/` que sustituye el placeholder `<p>404 — próximamente (H7)</p>`. Muestra código 404, título, descripción y botón de vuelta al inicio.

**Sistema de notificaciones aria-live**
`NotificationContext` + `NotificationProvider` con región `role="status" aria-live="polite"`. `useNotification().notify(msg)` disponible en cualquier componente bajo el proveedor. Auto-dismiss a los 4s. Integrado en `SeriesFormPage`, `SeriesDetailPage` y `UsersPage` para feedback de CRUD. El `NotificationProvider` vive dentro de `AuthProvider` en `App.tsx`.

**Focus trap en Modal**
Al abrir, el foco va al primer elemento focusable dentro del dialog (antes iba al contenedor, no al primer control). Tab/Shift+Tab ciclan dentro del modal sin escapar al DOM exterior.

**Estados de carga centrados**
`DashboardPage` y `UsersPage` envuelven el `<Spinner>` en un `div.center` con `display:flex; justify-content:center; align-items:center; min-height:200px`.

**Strings hardcodeados corregidos**
`UserList` usaba `'No hay usuarios.'` y `'Lista de usuarios'` literales. Ahora usa `MESSAGES.users.noUsers` y `MESSAGES.users.listAriaLabel`. `UsersPage` usaba `'Usuarios'` literal; ahora usa `MESSAGES.users.title`.

---

## H8 — Landing & entry flow · Complejidad: M ✅

- **Estado:** ✅ Completado.
- **Objetivo:** Punto de entrada visual de la app, público y sin autenticación.
- **Entregable:** ruta `/` con landing fullscreen, slideshow de portadas y acceso al login via modal.
- **Dependencias:** H7 (necesita el diseño pulido y todas las series con portadas del seed).

### Tareas

1. **`LandingPage`** en `src/pages/LandingPage/`:
   - Fullscreen (`100dvh`), sin `Header` ni `Layout` — layout propio.
   - Fondo: stack de imágenes absolutas, transición `opacity` con `transition: opacity 1.5s ease-in-out`, intervalo de 30s.
   - Fallback: gradiente con tokens del tema activo si no hay imágenes en BD.
   - Título y claim encima del fondo, con overlay oscuro para garantizar contraste legible en cualquier portada.
   - Botón "Entrar" → abre `LoginModal`.

2. **`useLandingImages`** en `src/hooks/`:
   - Carga todas las portadas de series via `imageService`.
   - Devuelve array de `ObjectURL` + estado `loading` + `hasFallback`.
   - Revoca las `ObjectURL` al desmontar.

3. **`LoginModal`** en `src/components/features/LoginModal/`:
   - Reutiliza el `Modal` de UI kit y el formulario de `LoginPage` (extraer la lógica del form a un componente `LoginForm` compartido si no lo está ya).
   - Post-login: cierra modal y redirige a `/series`.
   - Cierre: tecla Escape + click fuera + botón ✕.

4. **Redireccionamiento**:
   - Si el usuario ya tiene sesión activa y navega a `/`, redirige directamente a `/series`.
   - `/login` sigue existiendo como ruta directa (no romper flujo existente), pero en la práctica el entry point es la landing.

5. **Ruta `/`** en `App.tsx`:
   - Fuera del `Layout` existente (la landing tiene su propio layout).
   - Pública, sin `ProtectedRoute`.

### Archivos
- `src/pages/LandingPage/`
- `src/hooks/useLandingImages.ts`
- `src/components/features/LoginModal/`
- Extraer `src/components/features/LoginForm/` de `LoginPage` si hace falta
- Modificar `src/App.tsx` para la ruta `/`

### Tests
- `useLandingImages`: carga imágenes, fallback si BD vacía, revocación de URLs al desmontar.
- `LandingPage`: render con imágenes, render con fallback, botón "Entrar" abre modal.
- `LoginModal`: abre/cierra, post-login redirige a `/series`, Escape cierra.

### Hecho cuando
Arrancas la app, ves el slideshow de portadas con transición suave, abres el modal, te logueas y aterrizas en `/series`. Sin sesión, `/` siempre muestra la landing.

### Notas de implementación

**Extracción de `LoginForm`**
La lógica del formulario de login (schema Zod, RHF, handler de submit) se extrajo de `LoginPage` a `src/components/features/LoginForm/LoginForm.tsx`. La prop es `onSuccess: () => void`; el consumidor decide qué hacer tras el login. `LoginPage` navega a `from` (location state) o `/series`; `LoginModal` cierra el modal y navega a `/series`. El test de `LoginPage` no necesitó cambios de comportamiento.

**`LoginModal` sin lógica de autenticación propia**
`LoginModal` delega todo a `LoginForm`. Su única responsabilidad es abrir/cerrar el `Modal` y, en `onSuccess`, llamar a `onClose()` y luego `navigate('/series')`.

**Import de `useLandingImages` desde el barrel `@/hooks`**
Si `LandingPage.tsx` importa desde `@/hooks/useLandingImages` directamente, los tests que mockean `@/hooks` no interceptan el hook. Solución: importar siempre desde el barrel. Es el mismo patrón del resto de hooks del proyecto.

**`vi.hoisted` en `useLandingImages.test.ts`**
Las variables de mock declaradas con `const mockGetAll = vi.fn()` antes de `vi.mock(...)` fallan porque `vi.mock` se hiza al top del archivo. Mismo patrón que H2: usar `vi.hoisted(() => ({ mockGetAll: vi.fn(), mockGet: vi.fn() }))`.

**`<img alt="">` tiene role "presentation", no "img"**
Las imágenes del slideshow son decorativas (el padre tiene `aria-hidden="true"`), por lo que tienen `alt=""`. `getAllByRole('img', { hidden: true })` no las encuentra. Los tests usan `container.querySelectorAll('img')` para verificar su presencia en el DOM.

**Ruta `/` fuera del `<Layout>`**
`LandingPage` tiene su propio layout fullscreen sin `Header`. En `App.tsx` la ruta `/` se declara antes y fuera del `<Route element={<Layout />}>`. El resto de rutas (incluyendo `*` para 404) siguen dentro del Layout. El `Navigate to="/series"` que había en `/` se elimina al mismo tiempo — si queda, el navegador no llega nunca a renderizar `LandingPage`.

**Guard `authLoading` en `LandingPage`**
Si `useAuth` aún no ha resuelto su promesa de inicialización, `LandingPage` devuelve `null` para evitar el flash de contenido antes del redirect. El chequeo `if (authLoading) return null` debe ir antes de `if (user) return <Navigate>`, no después.

**Tests de `App.test.tsx` con `waitFor`**
Los tests sincrónicos de rutas `/` y `*` generan el warning `act(...)` porque `AuthProvider` actualiza estado de forma async. Solución: convertir esos tests en `async` y envolver el assert en `waitFor`.  El test de `/series` ya usaba `waitFor` y no necesita cambio.

---

## H9 — Mejoras de UX y refinamiento de la vista Series · Complejidad: M ✅

- **Objetivo:** Pulir la experiencia de navegación pública, mejorar la densidad y usabilidad del listado de series, y consolidar el flujo de logout con la landing.
- **Entregable:** toggle de tema con iconografía de bombilla, logout redirige a landing, dashboard accesible sin login, filtros del listado colapsables y enriquecidos, toggle cards/lista persistido, y cards más compactas tipo Netflix.
- **Estado:** ✅ Completado.
- **Dependencias:** H8 (logout → landing requiere que la landing exista).

### Tareas

1. **Iconografía del toggle de tema (bombilla):**
   - Sustituir el icono actual del switch claro/oscuro por dos SVG inline: bombilla encendida (modo claro activo) y bombilla apagada (modo oscuro activo).
   - SVG inline en `components/ui/ThemeToggle/` (o donde viva el toggle), sin librería de iconos.
   - Accesibilidad: `aria-label` dinámico (`"Cambiar a modo oscuro"` / `"Cambiar a modo claro"`) y `title` reflejando el estado actual. El icono lleva `aria-hidden="true"` — el contenido accesible vive en el botón.
   - Transición suave entre los dos estados (opacity o crossfade, 200ms).

2. **Logout redirige a landing:**
   - Modificar el handler de logout en `Header` (o donde se invoque `useAuth().logout`) para hacer `navigate('/')` tras el logout.
   - Limpiar cualquier estado de UI que dependa de la sesión (filtros sensibles a usuario, si los hubiera — revisar).

3. **Dashboard público sin login:**
   - Verificar / mover `/dashboard` fuera de `<ProtectedRoute>` en `App.tsx`.
   - Confirmar que `useDashboardMetrics` y los componentes de dashboard no asumen `user` definido. Si algún widget depende de auth (no debería), refactorizar.
   - El header en modo Viewer ya muestra el botón "Entrar" (no logout) — sin cambios ahí.

4. **Permisos para Viewer en el listado y detalle:**
   - Auditar que `canCreateSeries`, `canEditSeries`, `canDeleteSeries` (definidas en H4) devuelven `false` para `user === null`. Añadir test explícito si falta.
   - `SeriesListPage`: ocultar botón "Nueva serie" cuando no hay sesión.
   - `SeriesDetailPage`: ocultar botones editar/eliminar cuando no hay sesión (ya gestionado por permisos, verificar).
   - Las rutas `/series/new` y `/series/:id/edit` siguen protegidas — sin cambios.

5. **Filtros colapsables y enriquecidos en `SeriesListPage`:**
   - Nuevo componente `components/ui/Collapsible/` (reutilizable): cabecera clickable con chevron, contenido animado (`max-height` + `opacity`), `aria-expanded` correcto, navegable por teclado (Enter/Space).
   - Envolver los filtros existentes (búsqueda por título, multi-select de géneros, filtro de rating) dentro del `Collapsible`.
   - **Estado inicial: colapsado, no persistido entre sesiones.** Cada visita arranca colapsado.
   - Cabecera del colapsable muestra un contador de filtros activos cuando los hay (ej. "Filtros (2)").
   - Sincronización con URL querystring sigue intacta (los filtros se aplican aunque el panel esté colapsado).

6. **Toggle vista cards / vista lista:**
   - Nuevo control en `SeriesListPage` (botón segmentado con dos iconos: grid / list).
   - Tipo `ViewMode = 'cards' | 'list'` en `types/`.
   - Persistencia en `localStorage` bajo la clave `tv-shows:series-view-mode`. Lectura inicial vía hook custom `useSeriesViewMode` (devuelve `[mode, setMode]`, con guard para SSR / valor inválido).
   - El toggle solo cambia el modo de render — filtros, búsqueda, datos en pantalla y URL no se tocan.
   - **Vista lista:** nuevo componente `components/features/SeriesRow/` con thumbnail (≈48×72px), título, año, géneros (chips), rating (estrellas). Una fila por serie, click navega a `/series/:id` igual que la card.
   - **Vista cards:** el componente existente `SeriesCard` se mantiene como render por defecto.

7. **Compactar `SeriesCard` (tipo Netflix):**
   - Reducir la altura total de la card a ≈140-160px.
   - Portada con ratio horizontal o póster vertical muy compacto — ajuste fino visual al implementar.
   - Mantener título y rating visibles; el resto de info (géneros, año) pasa a tooltip / hover o solo al detalle, según quede mejor visualmente.
   - Grid responsive recalculado: más columnas por breakpoint (4-5 desktop, 3 tablet, 2 móvil) para aprovechar la densidad.

### Archivos
- `src/components/ui/ThemeToggle/` (modificar; los SVG pueden vivir inline o en archivo aparte si pesan).
- `src/components/layout/Header/` (modificar logout handler).
- `src/components/ui/Collapsible/` (nuevo).
- `src/components/features/SeriesRow/` (nuevo).
- `src/components/features/SeriesCard/` (modificar — compactar).
- `src/pages/SeriesListPage/` (modificar — envolver filtros, añadir toggle de vista, render condicional).
- `src/pages/DashboardPage/` o `src/App.tsx` (verificar / mover fuera de `ProtectedRoute`).
- `src/hooks/useSeriesViewMode.ts` (nuevo).
- `src/types/series.ts` (o nuevo `viewMode.ts`) — añadir `ViewMode`.
- `src/utils/permissions.ts` — añadir tests si faltan para `user === null`.

### Tests
- `ThemeToggle`: render del icono correcto según modo, `aria-label` dinámico, click cambia tema.
- Logout: tras `logout()`, navegación a `/`.
- `Collapsible`: abre/cierra con click y teclado, `aria-expanded` correcto, contador de filtros activos.
- `useSeriesViewMode`: lectura inicial desde localStorage, escritura persiste, fallback a `'cards'` si valor inválido o ausente.
- `SeriesListPage`: toggle cambia entre cards y lista respetando filtros y URL; sin sesión, no aparece "Nueva serie".
- `SeriesRow`: render de los 5 campos, click navega al detalle.
- `permissions`: `canCreate/Edit/DeleteSeries(null, ...)` devuelven `false`.
- Dashboard accesible sin sesión: render con `user === null` no rompe.

### Hecho cuando
- El toggle muestra bombilla encendida/apagada según el modo.
- Logout te lleva a `/`.
- Sin login, ves listado y dashboard pero no hay botones de crear/editar/borrar.
- Los filtros aparecen colapsados al entrar y muestran contador cuando hay activos.
- El toggle cards/lista cambia el render manteniendo filtros, y la preferencia persiste tras recarga.
- Las cards ocupan menos espacio vertical y caben más series en pantalla.

### Notas de implementación

**`max-height` en `.cover` de `SeriesCard` eliminado**
La combinación de `aspect-ratio: 2/3` + `max-height: 140px` hacía que el contenedor de la imagen se recortara antes de alcanzar el ancho de la columna, dejando franjas vacías a los lados. Solución: eliminar `max-height` y añadir `width: 100%`. Con solo `aspect-ratio`, el ancho de la columna del grid determina el ancho del cover, y la altura se calcula en proporción — la imagen ocupa el 100% sin distorsión gracias a `object-fit: cover`.

**Thumbnail de `SeriesRow` ampliado a 64×96px**
El tamaño original (48×72px) resultaba demasiado pequeño y hacía los ítems difíciles de distinguir. Se subió a 64×96px y el padding del `.row` pasó de `space-3` a `space-4` para dar más aire al contenido.

---

## Tabla resumen de dependencias

| Hito | Depende de | Complejidad |
|---|---|---|
| H0 Setup | — | S |
| H1 Visual + UI kit + showcase | H0 | L |
| H2 Datos + Listado + Detalle | H1 | L |
| H3 Auth + roles + ProtectedRoute | H2 | M |
| H4 CRUD series | H3 | L |
| H5 Dashboard | H4 | M |
| H6 Users (Admin) | H3 | M |
| H7 Pulido + a11y + cobertura | H5, H6 | M |
| H8 Landing & entry flow | H7 | M |
| H9 Mejoras UX vista Series | H8 | M |

> H5 y H6 son paralelizables entre sí (ambos dependen solo de H3/H4), pero H5 necesita H4 para validar reactividad. H6 puede empezarse en cuanto H3 esté hecho. H8 cierra el plan — depende de H7 para tener el diseño pulido y las portadas del seed completas.

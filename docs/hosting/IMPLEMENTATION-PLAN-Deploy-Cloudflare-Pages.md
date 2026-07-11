# Plan de implementación — Despliegue en Cloudflare Pages (free tier)

> Plan por **fases independientes** para publicar la SPA (`tvshows_site`, Vite + React 19 + TS, backend Supabase) en **Cloudflare Pages** (plan Free). Expande y concreta la tarea "Deploy (opcional)" de `F7` del plan de Supabase.
> Cada fase es autocontenida, con su entregable y criterio de "hecho". Salvo `P5`/`P7` (opcionales), el orden es secuencial.
>
> **Premisa:** tras el `build`, la app es **100% estática** (no hay SSR ni Pages Functions propias; el único backend es Supabase). Por eso el despliegue se reduce a servir `dist/` desde el edge + resolver el routing de SPA + inyectar las env vars de Vite en build.

---

## Decisiones de proyecto (parametrización del plan)

Acordadas / asumidas antes de empezar:

- **Plataforma:** Cloudflare Pages, plan Free. Bandwidth ilimitado, 500 builds/mes, 1 build concurrente, 20.000 archivos/sitio (el `dist` de Vite genera decenas, sin riesgo). Límite blando de 100 proyectos/cuenta (irrelevante: 1 proyecto).
- **Origen del build:** Cloudflare construye desde el repo. Node y pnpm los fija el repo (fuente de verdad versionada), **no** el dashboard.
- **Package manager:** pnpm (detectado por `pnpm-lock.yaml`). Cloudflare v3 soporta pnpm 10. Node se pinnea con `.node-version` (valor numérico exacto; los alias `lts/*` rompen el build).
- **Env vars de Vite:** solo `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Se **inyectan en build** (Vite las inlinea; no existen en runtime). La `anon key` es pública por diseño y va protegida por RLS.
- **Seguridad:** `SUPABASE_SERVICE_ROLE_KEY` **nunca** se sube a Cloudflare (coherente con la regla del proyecto: sin prefijo `VITE_`, solo scripts Node locales). En Cloudflare no hay ningún caso de uso para ella.
- **Routing SPA:** `BrowserRouter` (con los future flags v7 ya activos) exige reescritura de rutas profundas → fichero `public/_redirects` con `/* /index.html 200`, versionado en el repo (config en código, no en dashboard).
- **`base` de Vite:** `/` (default). La app se sirve desde la raíz de `*.pages.dev` / dominio propio → sin cambios. *(Solo habría que tocar `base` si se sirviera bajo un subpath, que no es el caso.)*
- **Rutas DEV-only:** `/showcase` y `/export` están gateadas con `import.meta.env.DEV` → no entran en el bundle de producción. Se verifica, no se toca.
- **Supabase:** proyecto único (EU). Los **preview deployments comparten la misma BD de producción** — aceptable para un proyecto personal; anotado como limitación consciente (ver `P3`).

### Decisión señalada (a confirmar antes de `P1`)

**Método de despliegue.** Dos vías válidas:

- **(A) Integración Git nativa de Cloudflare** *(recomendada)*: conectas el repo, Cloudflare buildea y despliega en cada push. Cero CI propia para el deploy, "push-to-deploy". Contrapartida: das a la GitHub App de Cloudflare permiso de lectura sobre el repo.
- **(B) `wrangler pages deploy` desde GitHub Actions** (`cloudflare/pages-action`): el build corre en tu CI, Cloudflare solo recibe el `dist`. Más control, secretos en GitHub, sin ceder acceso de repo a Cloudflare; encaja con que ya usas Actions (heartbeat). Contrapartida: mantienes un workflow más.

Este plan detalla **(A)** en el flujo principal y **(B)** como `P7` opcional. Recomiendo **(A)** por simplicidad de mantenimiento salvo que prefieras no dar acceso de repo a Cloudflare.

---

## Orden y dependencias

`P0 Prep repo → P1 Provisión + Git → P2 Env + build config → P3 Ajustes Supabase → P4 Deploy + verificación → (P5 Dominio propio · opc) → (P6 Headers/hardening · opc)`
`P7 (Alternativa Wrangler/Actions)` sustituye a `P1`/`P4` si eliges la vía (B).

| Fase | Depende de | Complejidad |
|---|---|---|
| P0 Preparación del repo | — | S |
| P1 Provisión Cloudflare + conexión Git | P0 | S |
| P2 Variables de entorno + config de build | P1 | S |
| P3 Ajustes en Supabase para el nuevo origen | P0 | S |
| P4 Primer deploy + verificación funcional | P1, P2, P3 | M |
| P5 Dominio propio (opcional) | P4 | S |
| P6 Headers de seguridad + caché + cierre (opcional) | P4 | M |
| P7 Alternativa: deploy vía Wrangler + GitHub Actions (opcional) | P0 | M |

---

## P0 — Preparación del repo para producción · Complejidad: S

- **Objetivo:** dejar el repo listo para un build reproducible en el edge, sin depender de configuración manual en el dashboard.
- **Entregable:** `_redirects` de SPA, pin de Node, verificación de build de producción en local.
- **Estado:** ⬜ Pendiente.
- **Dependencias:** ninguna.

### Tareas
1. **Routing SPA:** crear `public/_redirects` con una única línea:
   ```
   /*    /index.html   200
   ```
   Vite copia `public/*` a la raíz de `dist/`, así que Cloudflare lo lee como `dist/_redirects`. Sirve `index.html` (HTTP 200, no 404) para cualquier ruta que no matchee un asset estático → las rutas profundas (`/series/:id`, `/dashboard`, recarga en detalle) funcionan.
2. **Pin de Node:** crear `.node-version` en la raíz con la versión exacta que usas en local (p. ej. `20.11.1`). Evita el default viejo de Cloudflare y el clásico "funciona en mi máquina". *(No confíes en `engines` de `package.json`: Cloudflare no lo usa de forma fiable como fuente de versión.)*
3. **pnpm:** confirmar que `pnpm-lock.yaml` está versionado y actualizado (Cloudflare detecta pnpm por él). El campo `"packageManager"` ya pinneado ayuda; si más adelante el build detecta una versión de pnpm incorrecta, se fuerza con la env var `PNPM_VERSION` en `P2` (no lo añadas preventivamente).
4. **Verificar rutas DEV-only fuera del bundle:** `pnpm build` y comprobar que `/showcase` y `/export` no aparecen en `dist` (gate `import.meta.env.DEV`).
5. **Build de producción en local, con las env vars reales:**
   ```
   VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... pnpm build
   pnpm preview
   ```
   Navegar el `preview`: landing, login, listado, **recarga en `/series/:id`** (valida el `_redirects` en local vía el fallback de `vite preview`), dashboard, imágenes de Storage.

### Archivos
- `public/_redirects` (nuevo).
- `.node-version` (nuevo).
- `.gitignore` (confirmar que `.env.local` sigue ignorado; no se sube nada de secretos).

### Verificación / "Hecho cuando"
- `pnpm build` pasa limpio; `pnpm preview` sirve la app y las rutas profundas resuelven al recargar; `dist/_redirects` existe en el output.

---

## P1 — Provisión en Cloudflare + conexión Git · Complejidad: S

- **Objetivo:** proyecto de Pages creado y enlazado al repo, con la config de build correcta.
- **Entregable:** proyecto Pages apuntando a la rama de producción, framework preset Vite, sin desplegar todavía funcionalmente (o con un primer build "en bruto" que se validará en `P4`).
- **Estado:** ⬜ Pendiente.
- **Dependencias:** P0.

### Tareas
1. Crear cuenta Cloudflare (si no la tienes) y ir a **Workers & Pages → Create → Pages → Connect to Git**. Autorizar la GitHub App de Cloudflare **solo** sobre este repo (no "all repositories").
2. Seleccionar el repo y la **rama de producción** (`main`).
3. **Build settings:**
   - **Framework preset:** `Vite` (o `None` y rellenar a mano).
   - **Build command:** `pnpm build`.
   - **Build output directory:** `dist`.
   - **Root directory:** raíz del repo (`/`), salvo que el front viva en un subdirectorio.
4. **No** desplegar aún con confianza: las env vars van en `P2`. Si Cloudflare lanza un primer build automático y falla por env vars ausentes, es esperado; se corrige en `P2` y se re-despliega.

### Verificación / "Hecho cuando"
- El proyecto existe en el dashboard, enlazado a `main`, con `pnpm build` / `dist` configurados y detectando pnpm + la versión de Node de `.node-version` en el log de build.

---

## P2 — Variables de entorno + configuración de build · Complejidad: S

- **Objetivo:** que el build del edge disponga de las env vars de Vite, en producción y en previews.
- **Entregable:** `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` definidas para ambos entornos; build verde.
- **Estado:** ⬜ Pendiente.
- **Dependencias:** P1.

### Tareas
1. En **Settings → Environment variables**, añadir para **Production** y para **Preview** (mismos valores, un único proyecto Supabase):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   Al ser un build estático sin Pages Functions, solo importa que existan en **build time** (que es cuando Vite las inlinea).
2. **NO** añadir `SUPABASE_SERVICE_ROLE_KEY` ni ninguna clave con permisos elevados. Si alguna vez se necesitara un secreto server-side, iría en una Pages Function con su binding, nunca como env accesible al bundle.
3. (Solo si el log de `P1` mostró una versión de pnpm incorrecta) añadir `PNPM_VERSION` con la versión de tu `packageManager`.
4. Relanzar el deploy (Retry / nuevo push) y confirmar build verde.

### Verificación / "Hecho cuando"
- El build termina OK con las env vars presentes; en el bundle servido, el cliente Supabase apunta al proyecto correcto (se validará funcionalmente en `P4`).

---

## P3 — Ajustes en Supabase para el nuevo origen · Complejidad: S

- **Objetivo:** que Auth y los flujos basados en email funcionen desde el dominio de Cloudflare.
- **Entregable:** Site URL y Redirect URLs de Supabase actualizadas con los orígenes de Pages.
- **Estado:** ⬜ Pendiente.
- **Dependencias:** P0 (independiente de P1/P2; puede prepararse en paralelo).

### Tareas
1. En **Supabase → Authentication → URL Configuration**:
   - **Site URL:** el dominio de producción (`https://<proyecto>.pages.dev`, o el dominio propio si haces `P5`).
   - **Redirect URLs (allowlist):** añadir `https://<proyecto>.pages.dev/**` y, si vas a usar previews con flujos de email, el patrón de preview (`https://*.<proyecto>.pages.dev/**`). Añadir el dominio propio cuando exista.
2. **CORS / REST / Storage:** para login **email/password** con la `anon key` no hace falta allowlist de orígenes (Supabase sirve REST/Storage/Auth cross-origin por defecto; la protección real es RLS). No hay que tocar nada de CORS.
3. **Nota consciente (previews):** los preview deployments usan el mismo proyecto Supabase que producción → escriben en la BD real. Aceptable para un proyecto personal. Si en el futuro molesta, se separa un proyecto Supabase de staging + env vars de Preview distintas (fuera de scope).

### Verificación / "Hecho cuando"
- Site URL y Redirect URLs reflejan el/los origen(es) de Cloudflare; el login desde el dominio de Pages no da error de redirect (se comprueba en `P4`).

---

## P4 — Primer deploy + verificación funcional · Complejidad: M

- **Objetivo:** app publicada y validada end-to-end en el dominio `*.pages.dev`.
- **Entregable:** URL pública funcional, smoke test completo pasado.
- **Estado:** ⬜ Pendiente.
- **Dependencias:** P1, P2, P3.

### Tareas
1. Forzar un deploy limpio (push a `main` o Retry) y esperar build verde.
2. **Smoke test** sobre la URL de producción:
   - **Landing** (`/`): slideshow de portadas, botón "Entrar" abre el `LoginModal`.
   - **Routing profundo:** navegar a `/series/:id` y **recargar** (F5). Debe cargar el detalle, no un 404 → valida `_redirects` en el edge.
   - **Auth:** login con un usuario real; recargar y seguir logueado (sesión persistida por `supabase-js`); logout redirige a `/`.
   - **Lectura pública:** listado y dashboard accesibles **sin** sesión (Viewer); sin botones de crear/editar/borrar.
   - **Storage:** las portadas se ven en listado y detalle (resolución de `cover_image_path` → URL).
   - **Escritura (admin):** crear/editar una serie pegando una imagen (paste) → se sube a Storage y aparece; borrar → desaparece del bucket.
   - **Preferencias UI:** cambiar tema/modo y recargar → persisten (localStorage).
3. Revisar el **log de build** por warnings relevantes (versión de Node/pnpm, tamaño de bundle).
4. Anotar la URL y el **rollback**: cada deployment queda inmutable; ante un fallo, "Rollback" al deployment anterior desde el dashboard con un clic.

### Verificación / "Hecho cuando"
- Todos los puntos del smoke test pasan en `*.pages.dev`, incluida la recarga en rutas profundas y el ciclo completo de CRUD con Storage y Auth.

---

## P5 — Dominio propio (opcional) · Complejidad: S

- **Objetivo:** servir la app bajo un dominio propio con HTTPS.
- **Entregable:** dominio custom apuntando al proyecto Pages, SSL activo, Supabase actualizado.
- **Estado:** ⬜ Opcional.
- **Dependencias:** P4.

### Tareas
1. **Pages → Custom domains → Set up a domain.** Si el dominio ya está en Cloudflare DNS, el `CNAME` se crea solo; si está fuera, seguir las instrucciones de DNS que indique el panel.
2. Esperar la emisión del certificado SSL (automático).
3. **Actualizar Supabase** (`P3`): cambiar **Site URL** al dominio propio y añadirlo a **Redirect URLs**.
4. Re-verificar el smoke test de `P4` sobre el dominio propio (sobre todo Auth y los enlaces de email si los usas).

### Verificación / "Hecho cuando"
- El dominio propio sirve la app con HTTPS válido y el login funciona desde él sin errores de redirect.

---

## P6 — Headers de seguridad + caché + cierre (opcional) · Complejidad: M

- **Objetivo:** endurecer las cabeceras y documentar el despliegue, sin romper Supabase.
- **Entregable:** `public/_headers` con cabeceras sensatas; doc breve de despliegue.
- **Estado:** ⬜ Opcional.
- **Dependencias:** P4.

### Tareas
1. **`public/_headers`** (versionado en repo, como `_redirects`). Base segura sin CSP:
   ```
   /*
     X-Content-Type-Options: nosniff
     Referrer-Policy: strict-origin-when-cross-origin
     X-Frame-Options: DENY
     Permissions-Policy: geolocation=(), camera=(), microphone=()
   ```
   Los assets con hash de Vite ya se sirven cacheados (immutable) por Cloudflare; no hace falta forzar `Cache-Control` para ellos. Cuidado con no cachear agresivamente `index.html`.
2. **CSP (con cuidado, iterativo):** si añades `Content-Security-Policy`, tiene que contemplar los orígenes de Supabase: `connect-src` (URL del proyecto, incluido `wss:` si usas realtime), `img-src` (bucket de Storage / `data:` y `blob:` para los previews de portada por paste). Empezar en `Content-Security-Policy-Report-Only` para no romper la app, verificar en consola, y solo entonces promover a `Content-Security-Policy`. **No** cierres esto a ciegas.
3. **Documentar** el despliegue en `docs/` (o en `CONTEXT.md`): plataforma, build command/output, dónde viven las env vars, cómo hacer rollback, y la nota de que las previews usan la BD de producción.

### Verificación / "Hecho cuando"
- Las cabeceras se sirven (comprobado en DevTools/`curl -I`), la app sigue funcionando (Auth, Storage, imágenes) y el despliegue queda documentado en un único doc canónico.

---

## P7 — Alternativa: deploy vía Wrangler + GitHub Actions (opcional) · Complejidad: M

> Sustituye la integración Git nativa (`P1` + trigger de `P4`) si prefieres que el build corra en **tu** CI y no dar acceso de repo a Cloudflare. El resto de fases (`P0`, `P2` valores como secrets de GitHub, `P3`, verificación de `P4`) se mantienen.

- **Objetivo:** desplegar `dist/` a Pages desde un workflow propio.
- **Estado:** ⬜ Opcional (excluyente con la vía A).
- **Dependencias:** P0.

### Tareas
1. Crear el proyecto Pages en modo **Direct Upload** (sin conectar Git).
2. En Cloudflare, generar un **API Token** con permiso *Cloudflare Pages: Edit* y anotar el **Account ID**.
3. En **GitHub → Settings → Secrets and variables → Actions**, añadir: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
4. Workflow (`.github/workflows/deploy.yml`) que en push a `main`: `pnpm install --frozen-lockfile` → `pnpm build` (con las env vars de Vite desde secrets) → `cloudflare/pages-action` con `directory: dist`. Usar Corepack para la versión de pnpm del `packageManager`.
5. Coherencia con tus reglas de Git: commits convencionales, lockfile pnpm, lint/test antes de build en el propio workflow si quieres bloquear deploys con la suite roja.

### Verificación / "Hecho cuando"
- Un push a `main` dispara el workflow, buildea con las env vars correctas y publica en Pages; el smoke test de `P4` pasa.

---

## Resumen operativo (checklist mínima para la vía A)

1. `public/_redirects` (`/* /index.html 200`) + `.node-version` → commit.
2. `pnpm build` + `pnpm preview` locales OK (recarga en rutas profundas incluida).
3. Pages → Connect to Git → build `pnpm build`, output `dist`.
4. Env vars `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` en Production **y** Preview. Nada de `service_role`.
5. Supabase → Auth → Site URL + Redirect URLs con el origen de Pages.
6. Deploy → smoke test completo → (dominio propio / headers si procede).

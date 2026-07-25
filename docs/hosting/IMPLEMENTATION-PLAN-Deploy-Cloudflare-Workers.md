# Plan de implementación — Despliegue en Cloudflare Workers (free tier)

> Plan por **fases independientes** para publicar la SPA (`tvshows_site`, Vite + React 19 + TS, backend Supabase) en **Cloudflare Workers** (plan Free, vía Workers Static Assets). Expande y concreta la tarea "Deploy (opcional)" de `F7` del plan de Supabase.
> Cada fase es autocontenida, con su entregable y criterio de "hecho". Salvo `P5`/`P7` (opcionales), el orden es secuencial.
>
> **Premisa:** tras el `build`, la app es **100% estática** (no hay SSR ni lógica server-side propia; el único backend es Supabase). El despliegue se reduce a servir `dist/` como Static Assets del Worker + resolver el routing de SPA + inyectar las env vars de Vite en build.
>
> **Cambio de plataforma respecto a la versión original de este plan:** Cloudflare **ya no ofrece Pages clásico** para proyectos nuevos — la vía soportada es **Workers con Static Assets**. Cloudflare conectó el repo automáticamente vía su GitHub App y ya aterrizó parte de `P0`/`P1` en un commit bot (`cbdb948 "Add Cloudflare Workers configuration"`): añadió `wrangler.jsonc`, `@cloudflare/vite-plugin`, `wrangler` como devDependency, y reescribió los scripts `preview`/`deploy` de `package.json`. Este plan documenta ese estado real, no lo que se habría hecho manualmente desde cero.

---

## Decisiones de proyecto (parametrización del plan)

Acordadas / asumidas antes de empezar:

- **Plataforma:** Cloudflare Workers (Static Assets), plan Free. Sin Pages Functions ni bindings de KV/D1/R2 — el Worker solo sirve assets estáticos.
- **Origen del build:** Cloudflare construye desde el repo vía su GitHub App, ya conectada. Node y pnpm los fija el repo (fuente de verdad versionada), **no** el dashboard.
- **Package manager:** pnpm (detectado por `pnpm-lock.yaml`, `packageManager: pnpm@9.15.0` pinneado). Node se pinnea con `.node-version` (valor numérico exacto; los alias `lts/*` rompen el build).
- **Env vars de Vite:** solo `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Se **inyectan en build** (Vite las inlinea; no existen en runtime). La `anon key` es pública por diseño y va protegida por RLS.
- **Seguridad:** `SUPABASE_SERVICE_ROLE_KEY` y cualquier credencial de scripts locales (`ADMIN_PASSWORD`, `USER_PASSWORD`, …) **nunca se declaran en Cloudflare** — ni como Environment Variable ni como Secret del Worker. El Worker no tiene código server-side propio que las necesite; solo existen en `.env.local` para scripts Node locales. **Cuidado con la confusión de `wrangler dev`:** en local, `@cloudflare/vite-plugin` carga *todas* las vars de `.env.local` como bindings del Worker para simular el entorno (se ven en el log de `wrangler dev` como "Environment Variable"). Esto es **solo simulación local** — verificado con `wrangler deploy --dry-run`, que devuelve `No bindings found` cuando `wrangler.jsonc` no declara nada en `vars`. En el deploy real nada de `.env.local` se sube por arrastre.
- **Routing SPA:** resuelto de forma **nativa por Workers Static Assets**, sin fichero `_redirects` (eso es específico de Pages clásico y ya no aplica). `wrangler.jsonc` declara:
  ```jsonc
  "assets": { "not_found_handling": "single-page-application" }
  ```
  Verificado en local con `wrangler dev`: `/series/:id` responde `200` con `index.html`, no `404`.
- **`base` de Vite:** `/` (default). Sin cambios.
- **Rutas DEV-only:** `/showcase` está gateada con `import.meta.env.DEV` en `App.tsx`. **Hallazgo corregido en `P0`:** el gate por sí solo no sacaba el código de `ShowcasePage` del bundle de producción (el import estático desde el barrel `@/pages` impedía el tree-shaking; se comprobó buscando el string `"Showcase de componentes"` en `dist/assets/index-*.js`). Se solucionó con `React.lazy()` + `Suspense` en `App.tsx`, que separa `ShowcasePage` en un chunk propio (`ShowcasePage-*.js`, ~7.75 kB) nunca descargado en producción. No existe ninguna ruta `/export` en `App.tsx` — mención obsoleta del plan original, descartada.
- **Vitest roto por el plugin de Cloudflare:** el commit bot añadió `cloudflare()` a `vite.config.ts`; como `vitest.config.ts` hace `mergeConfig(viteConfig, …)`, Vitest heredaba ese plugin y el arranque del servidor Vite fallaba (`TypeError: Cannot convert undefined or null to object` en `configureServer`). Corregido condicionando el plugin a que **no** se esté ejecutando bajo Vitest:
  ```ts
  plugins: [react(), ...(process.env.VITEST ? [] : [cloudflare()])],
  ```
  `process.env.VITEST` lo define el propio Vitest. Confirmado con `git stash` que el fallo ya existía antes de esta sesión (no es una regresión introducida al arreglar `P0`).
- **Supabase:** proyecto único (EU). Los **preview deployments comparten la misma BD de producción** — aceptable para un proyecto personal; anotado como limitación consciente (ver `P3`).

### Decisión señalada (ya resuelta de facto)

La integración Git nativa de Cloudflare (equivalente a la opción **(A)** de la versión Pages de este plan) **ya está activa**: la GitHub App de Cloudflare conectó el repo y generó el commit de configuración inicial sin intervención manual explícita en el dashboard documentada en este plan. `P7` (alternativa vía Wrangler + GitHub Actions manual) queda como opción descartada salvo que se quiera dejar de dar acceso de repo a Cloudflare.

---

## Orden y dependencias

`P0 Prep repo → P1 Provisión + Git → P2 Env + build config → P3 Ajustes Supabase → P4 Deploy + verificación → (P5 Dominio propio · opc) → (P6 Headers/hardening · opc)`
`P7 (Alternativa Wrangler/Actions)` sustituye a `P1`/`P4` si se decide dejar de usar la integración Git nativa.

| Fase | Depende de | Complejidad | Estado |
|---|---|---|---|
| P0 Preparación del repo | — | S | ✅ Hecho |
| P1 Provisión Cloudflare + conexión Git | P0 | S | ✅ Hecho (confirmado en dashboard) |
| P2 Variables de entorno + config de build | P1 | S | ✅ Hecho |
| P3 Ajustes en Supabase para el nuevo origen | P0 | S | ✅ Hecho |
| P4 Primer deploy + verificación funcional | P1, P2, P3 | M | ✅ Hecho |
| P5 Dominio propio (opcional) | P4 | S | ⬜ Opcional |
| P6 Headers de seguridad + caché + cierre (opcional) | P4 | M | ⬜ Opcional |
| P7 Alternativa: deploy vía Wrangler + GitHub Actions (opcional) | P0 | M | ⬜ Descartado (P1 ya resuelto vía Git nativa) |

---

## P0 — Preparación del repo para producción · Complejidad: S

- **Objetivo:** dejar el repo listo para un build reproducible en el edge, sin depender de configuración manual en el dashboard.
- **Entregable:** pin de Node, routing SPA verificado (nativo de Workers), rutas DEV-only realmente fuera del bundle, Vitest funcionando de nuevo, build de producción verificado en local.
- **Estado:** ✅ **Hecho.**
- **Dependencias:** ninguna.

### Tareas realizadas
1. ~~Routing SPA vía `public/_redirects`~~ — **no aplica en Workers.** Ya resuelto de forma nativa por `assets.not_found_handling: "single-page-application"` en `wrangler.jsonc` (traído por el commit bot de Cloudflare). Verificado con `wrangler dev` + `curl`: `/` y `/series/123abc` responden `200` con `index.html`.
2. **Pin de Node:** creado `.node-version` con `22.22.2` (versión exacta usada en local).
3. **pnpm:** `pnpm-lock.yaml` versionado y al día; `packageManager: pnpm@9.15.0` pinneado. `@cloudflare/vite-plugin` estaba en el lockfile pero no instalado en `node_modules`; corregido con `pnpm install` (sin tocar el lockfile).
4. **Rutas DEV-only fuera del bundle:** `/showcase` gateada con `import.meta.env.DEV`, pero el componente entraba igualmente en `dist/assets/index-*.js` (comprobado buscando el string `"Showcase de componentes"`). Corregido con `React.lazy()` + `Suspense` en `App.tsx` — ahora vive en un chunk aparte, no descargado en producción. `/export` no existe como ruta; mención descartada.
5. **Vitest roto por `cloudflare()` en `vite.config.ts`:** corregido excluyendo el plugin bajo `process.env.VITEST`. 327/327 tests pasan, lint limpio.
6. **Build de producción en local, con las env vars reales de `.env.local`:**
   ```
   pnpm build       # limpio, tsc -b + vite build
   pnpm run preview # build && wrangler dev
   ```
   Verificado: landing, routing profundo (`/series/:id` con reload → 200), sin errores de consola relevantes.

### Archivos modificados
- `.node-version` (nuevo).
- `src/App.tsx` (lazy-load de `ShowcasePage`).
- `vite.config.ts` (plugin `cloudflare()` excluido bajo Vitest).
- `.gitignore` (confirmado: `.env.local` sigue ignorado; el commit bot ya añadió `.wrangler` y `.dev.vars*`).

### Verificación / "Hecho cuando"
- `pnpm build`, `pnpm lint` y `pnpm test:run` pasan limpios; `wrangler dev` sirve la app y las rutas profundas resuelven sin `_redirects`; `ShowcasePage` no aparece en el chunk principal de producción.

---

## P1 — Provisión en Cloudflare + conexión Git · Complejidad: S

- **Objetivo:** Worker creado y enlazado al repo, con la config de build correcta.
- **Estado:** ✅ **Hecho.** La GitHub App de Cloudflare conectó el repo y generó `wrangler.jsonc` + dependencias (`cbdb948`); confirmado en el dashboard (Settings → Build) el resto de la configuración.
- **Dependencias:** P0.

### Qué quedó configurado
- `wrangler.jsonc`: `name: "tvshows"`, `compatibility_date`, `observability.enabled: true`, `assets.not_found_handling: "single-page-application"`, `compatibility_flags: ["nodejs_compat"]`.
- `package.json`: `preview` → `pnpm run build && wrangler dev`; script `deploy` → `pnpm run build && wrangler deploy` (no usado directamente por Cloudflare, ver abajo).
- `vite.config.ts`: plugin `cloudflare()` (ahora excluido bajo Vitest, ver `P0`).
- **Dashboard (Settings → Build), confirmado por el usuario:**
  - **Build command:** `pnpm build`
  - **Deploy command:** `npx wrangler deploy`
  - **Non-production branch deploy command:** `npx wrangler versions upload`
  - **Path:** `/`
  - Nota: Cloudflare separa build y deploy en dos comandos propios del dashboard (`pnpm build` + `npx wrangler deploy`), **no** llama al script `deploy` de `package.json`. Usa `npx` (no `pnpm exec`) porque el paso de deploy corre en un contexto sin el `node_modules` del build — `npx` resuelve `wrangler` bajo demanda.
- **Rama de producción:** `main` — confirmado en el dashboard (Settings → Build → Production branch).

### Verificación / "Hecho cuando"
- El proyecto Worker existe en el dashboard, enlazado al repo, con `pnpm build` + `npx wrangler deploy` configurados como Build/Deploy command.

---

## P2 — Variables de entorno + configuración de build · Complejidad: S

- **Objetivo:** que el build del edge disponga de las env vars de Vite, en producción y en previews.
- **Entregable:** `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` definidas; build verde.
- **Estado:** ✅ **Hecho.**
- **Dependencias:** P1.

### Tareas realizadas
1. **Hallazgo:** el Worker es solo de Static Assets (sin `_worker.js`/entrypoint), así que **Settings → Variables and Secrets** a nivel de Worker (runtime) rechaza cualquier variable con el error *"Variables cannot be added to a Worker that only has static assets"*. Las env vars de build-time viven en una ubicación distinta: dentro de **Settings → Build**, hay su propia sección **Variables and Secrets** (build-time, para el proceso `pnpm build`), separada de la de runtime.
2. Añadidas ahí `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
3. **NO** se añadió `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `USER_PASSWORD` ni ninguna credencial de scripts Node — el Worker no tiene código server-side que las use.
4. Deploy relanzado — build verde confirmado.

### Verificación / "Hecho cuando"
- ✅ El build termina OK con las env vars presentes. La validación funcional (que el cliente Supabase del bundle apunte al proyecto correcto) se confirma en `P4`.

---

## P3 — Ajustes en Supabase para el nuevo origen · Complejidad: S

- **Objetivo:** que Auth y los flujos basados en email funcionen desde el dominio de Cloudflare.
- **Entregable:** Site URL y Redirect URLs de Supabase actualizadas con el origen del Worker.
- **Estado:** ✅ **Hecho.**
- **Dependencias:** P0 (independiente de P1/P2; puede prepararse en paralelo).

### Tareas
1. En **Supabase → Authentication → URL Configuration**:
   - **Site URL:** el dominio de producción del Worker (`https://<worker>.<subdominio>.workers.dev`, o el dominio propio si se hace `P5`).
   - **Redirect URLs (allowlist):** añadir el origen de producción y, si aplica, el patrón de preview de Cloudflare Workers.
2. **CORS / REST / Storage:** login email/password con `anon key` no requiere allowlist de orígenes (Supabase sirve REST/Storage/Auth cross-origin por defecto; la protección real es RLS). No tocar CORS.
3. **Nota consciente (previews):** si Cloudflare genera preview deployments para el Worker, comparten el mismo proyecto Supabase que producción → escriben en la BD real. Aceptable para un proyecto personal.

### Verificación / "Hecho cuando"
- Site URL y Redirect URLs reflejan el origen de Cloudflare; el login desde el dominio del Worker no da error de redirect (se comprueba en `P4`).

---

## P4 — Primer deploy + verificación funcional · Complejidad: M

- **Objetivo:** app publicada y validada end-to-end en el dominio `*.workers.dev`.
- **Entregable:** URL pública funcional, smoke test completo pasado.
- **Estado:** ✅ **Hecho.** URL de producción: `https://tvshows.alminyana.workers.dev`.
- **Dependencias:** P1, P2, P3.

### Tareas
1. Forzar un deploy limpio (push a la rama de producción) y esperar build verde.
2. **Smoke test** sobre la URL de producción:
   - **Landing** (`/`): slideshow de portadas, botón "Entrar" abre el `LoginModal`.
   - **Routing profundo:** navegar a `/series/:id` y **recargar** (F5). Debe cargar el detalle, no un 404 → valida `assets.not_found_handling` en el edge real (ya probado en local con `wrangler dev`, falta confirmar en el deploy real).
   - **Auth:** login con un usuario real; recargar y seguir logueado; logout redirige a `/`.
   - **Lectura pública:** listado y dashboard accesibles **sin** sesión (Viewer); sin botones de crear/editar/borrar.
   - **Storage:** las portadas se ven en listado y detalle (resolución de `cover_image_path` → URL).
   - **Escritura (admin):** crear/editar una serie pegando una imagen (paste) → se sube a Storage y aparece; borrar → desaparece del bucket.
   - **Preferencias UI:** cambiar tema/modo y recargar → persisten (localStorage).
   - **`/showcase` en producción:** confirmar que la ruta **no** es navegable (404 o redirect), coherente con el fix de `P0`.
3. Revisar el **log de build** por warnings relevantes (versión de Node/pnpm, tamaño de bundle — ya hay warning de chunk >500 kB en el bundle principal, ~278 kB gzip).
4. Anotar la URL y el **rollback**: cada deployment de Worker queda versionado; ante un fallo, rollback al deployment anterior desde el dashboard.

### Verificación / "Hecho cuando"
- ✅ Todos los puntos del smoke test pasan en `*.workers.dev`, incluida la recarga en rutas profundas y el ciclo completo de CRUD con Storage y Auth.

### Nota — hallazgo durante el deploy
Una de las dos env vars (`VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`) en **Settings → Build → Variables and Secrets** estaba mal introducida, causando `Uncaught Error: Invalid supabaseUrl` en runtime (página en blanco). Corregido el valor y relanzado el deploy; smoke test completo pasado tras el fix.

---

## P5 — Dominio propio (opcional) · Complejidad: S

- **Objetivo:** servir la app bajo un dominio propio con HTTPS.
- **Estado:** ⬜ Opcional.
- **Dependencias:** P4.

### Tareas
1. **Workers → Triggers → Custom Domains → Add Custom Domain.** Si el dominio ya está en Cloudflare DNS, el registro se crea solo; si está fuera, seguir las instrucciones de DNS del panel.
2. Esperar la emisión del certificado SSL (automático).
3. **Actualizar Supabase** (`P3`): cambiar **Site URL** al dominio propio y añadirlo a **Redirect URLs**.
4. Re-verificar el smoke test de `P4` sobre el dominio propio (sobre todo Auth y enlaces de email si se usan).

### Verificación / "Hecho cuando"
- El dominio propio sirve la app con HTTPS válido y el login funciona desde él sin errores de redirect.

---

## P6 — Headers de seguridad + caché + cierre (opcional) · Complejidad: M

- **Objetivo:** endurecer las cabeceras y documentar el despliegue, sin romper Supabase.
- **Estado:** ⬜ Opcional.
- **Dependencias:** P4.

### Tareas
1. **Cabeceras de seguridad:** en Workers Static Assets no existe `public/_headers` (eso es de Pages). La vía equivalente es un `_headers`-like config en `wrangler.jsonc` (`assets.headers`, si la versión de Wrangler lo soporta) o interceptar la petición con un Worker script mínimo que añada cabeceras antes de servir el asset. A definir según lo que soporte la versión de `wrangler` instalada (`4.110.0`).
2. **CSP (con cuidado, iterativo):** si se añade `Content-Security-Policy`, contemplar los orígenes de Supabase: `connect-src` (URL del proyecto, incluido `wss:` si se usa realtime), `img-src` (bucket de Storage / `data:` y `blob:` para paste de portadas). Empezar en modo Report-Only.
3. **Documentar** el despliegue final (plataforma, dónde viven las env vars, cómo hacer rollback, nota de previews compartiendo BD) en un único doc canónico — este mismo.

### Verificación / "Hecho cuando"
- Las cabeceras se sirven (comprobado con `curl -I`), la app sigue funcionando (Auth, Storage, imágenes) y el despliegue queda documentado.

---

## P7 — Alternativa: deploy vía Wrangler + GitHub Actions (opcional) · Complejidad: M

> Descartado por ahora: `P1` ya está resuelto vía integración Git nativa de Cloudflare. Esta fase queda documentada por si en el futuro se prefiere dejar de dar acceso de repo a Cloudflare y mover el build a GitHub Actions (coherente con que el proyecto ya usa Actions para el heartbeat de Supabase).

- **Estado:** ⬜ Descartado.
- **Dependencias:** P0.

### Tareas (si se retoma)
1. Desconectar el repo de la integración Git de Cloudflare; el Worker pasaría a modo deploy manual/API.
2. Generar un **API Token** con permiso *Workers Scripts: Edit* y anotar el **Account ID**.
3. En **GitHub → Settings → Secrets and variables → Actions**, añadir: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
4. Workflow (`.github/workflows/deploy.yml`) que en push a la rama de producción: `pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm test:run` → `pnpm run deploy` (usa `wrangler deploy` ya presente en `package.json`, con las env vars de Vite desde secrets).

### Verificación / "Hecho cuando"
- Un push a la rama de producción dispara el workflow, buildea con las env vars correctas y publica el Worker; el smoke test de `P4` pasa.

---

## Resumen operativo (estado actual)

1. ✅ `.node-version`, routing SPA nativo, rutas DEV-only fuera del bundle, Vitest arreglado — todo commiteado y mergeado (`334a35b` / PR #76).
2. ✅ `wrangler.jsonc` + integración Git conectada; Build/Deploy command confirmados en el dashboard (`pnpm build` / `npx wrangler deploy` / `npx wrangler versions upload` para no-producción).
3. ✅ `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` declaradas en **Settings → Build → Variables and Secrets** (build-time, no la de runtime del Worker); deploy relanzado y verde.
4. ✅ Supabase → Auth → Site URL + Redirect URLs con el origen `*.workers.dev`.
5. ✅ Deploy en producción (`https://tvshows.alminyana.workers.dev`) → smoke test completo pasado (`P4`) → (dominio propio / headers si procede, `P5`/`P6` opcionales).

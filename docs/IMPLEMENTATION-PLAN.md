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
     - `Rating` (estrellas 1-5, modo read y modo input; el modo input rellena de la 1 a la clicada y previsualiza en hover — ver nota en H9).
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
     - `seasons`: texto libre no vacío (ver nota en H9 — el campo dejó de ser numérico).
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

### Refactor del fondo de la landing (post H9): imágenes estáticas + slideshow animado ✅

- **Estado:** ✅ Implementado.

El slideshow original tomaba las portadas de las series desde IndexedDB vía `useLandingImages`. Se sustituyó por un set fijo de imágenes estáticas servidas como assets de Vite, con animación de crossfade + Ken Burns. Motivos: las portadas del seed no tienen relación temática con la landing y el primer slide (índice 0) se pintaba sobre cualquier fondo base tapándolo; además, cargar Blobs desde Dexie para algo puramente decorativo era innecesario.

**Imágenes como assets importados (no `background-image` de SCSS ni Blobs de BD)**
Las imágenes viven en `src/assets/*.webp` y se importan directamente en `LandingPage.tsx` (`import bg1 from '@/assets/...webp'`). Vite las procesa (hash + URL correcta en dev y build). Se descartó `background-image: url(...)` en el `.module.scss` porque la ruta relativa no resolvía de forma fiable; el import en TS es el patrón robusto. La declaración de tipos para `*.webp` la aporta `vite/client` (ya referenciada en `vite-env.d.ts`).

**Slideshow con crossfade + Ken Burns**
- `BACKGROUNDS` es un array con las 5 imágenes; `currentIndex` avanza con `setInterval` y wrap-around (`(i + 1) % length`) cada `SLIDE_INTERVAL_MS` (5 s actualmente).
- Cada imagen es un `<img className={slide + (activa ? slideActive : '')}>` apilado en absoluto dentro de `.background`.
- `.slide`: `opacity: 0` + `transform: scale(1.05)`; `.slideActive`: `opacity: 1` + `scale(1)`. La transición (`opacity 2s ease-in-out, transform 20s ease-out`) produce el fundido suave de 2 s y un zoom-out lento tipo Ken Burns mientras la imagen está visible, en lugar de un fade plano.

**Velo oscuro sobre todas las imágenes**
`.overlay` es un degradado `rgba(0,0,0,0.55)` → `rgba(0,0,0,0.8)` (top→bottom) por encima del stack de slides, garantizando contraste del título/claim/botón sobre cualquier imagen. Se oscureció respecto al original de H8 (`0.35`→`0.6`).

**Más espacio entre título, claim y botón**
`.content` subió su `gap` de `--space-4` a `--space-7`.

**`useLandingImages` eliminado**
Al dejar de consumir portadas de BD, el hook quedó huérfano. Se borró `useLandingImages.ts` + su test, el export del barrel `hooks/index.ts` y el mock en `App.test.tsx`. Los tests de `LandingPage` se simplificaron: ya no mockean el hook ni distinguen estados de carga/fallback (la landing siempre tiene fondo). Las notas de H8 sobre `useLandingImages` (import desde barrel, `vi.hoisted`, role "presentation") quedan como contexto histórico — el hook ya no existe.

**`baseUrl` eliminado de `tsconfig.app.json`**
Con `moduleResolution: "bundler"` (TS 5.x), `paths` ya no necesita `baseUrl`; tsserver lo marcaba como innecesario. Se quitó `"baseUrl": "."` y `paths` pasó a ruta relativa autocontenida (`"@/*": ["./src/*"]`). El `tsconfig.json` raíz mantiene su propio par `baseUrl`+`paths` sin tocar.

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

**Seed extraído a `src/db/seed.json`**
Los datos de series del seed se movieron a `src/db/seed.json` (importado con `resolveJsonModule`, ya activo en `tsconfig.app.json`). `seed.ts` importa el JSON, lo tipifica con la interfaz interna `SeedEntry` y normaliza los campos antes de insertar:
- `cast`: si no es array o contiene no-strings, se trata como `[]` (había una entrada con un objeto Excel).
- `year`: si es string tipo `"2001-2010"` se extrae el primer año con regex; si falta, se usa el año actual.
- `rating`: si falta, defaul a `0`.
- `synopsis`: si falta, default a `''`.
- `genres`: default a `[]` (no está en el JSON; la validación del formulario requiere ≥1, pero el seed los bypasea).
- `createdBy`: todos los registros se asignan al `adminId` generado en el momento del seed.
El archivo `seed.json` es la única fuente de verdad para los datos de series; para añadir, quitar o editar mocks solo hay que editar ese archivo.

**`Series.seasons` cambiado de `number` a `string`**
El campo dejó de representar un recuento numérico de temporadas y pasó a ser un texto libre descriptivo (ej. "5 temporadas emitidas entre 2008 y 2013"). Cambios asociados:
- `types/series.ts`: `seasons: number` → `seasons: string`.
- `utils/seriesSchema.ts`: de `z.coerce.number().int().min(1)` a `z.string().min(1)`.
- `SeriesForm`: el control pasó de `<Input type="number">` (en fila con `year`) a un `<Textarea>` a ancho completo, al ser ahora texto explicativo. `year` queda como campo propio.
- `SeriesDetailPage`: se elimina la lógica singular/plural (`series.seasons === 1 ? 'temporada' : 'temporadas'`); ahora se muestra el texto tal cual.
- Seed, mock del showcase y fixtures de tests migrados a string.
- **Migración Dexie (implementada post-H10):** `database.ts` añade `version(2).upgrade()` que recorre la tabla `series` con `.modify()` y normaliza el campo vía el helper puro `utils/migrateSeasons.ts` (número → `"N temporada"`/`"N temporadas"`, replicando la antigua lógica singular/plural de `SeriesDetailPage`; los strings ya existentes pasan sin cambios). El schema no cambia, así que v2 hereda el `stores` de v1 y solo ejecuta el upgrade. Es idempotente: en instalaciones nuevas el seed ya escribe strings y el helper los devuelve tal cual. Tests puros en `migrateSeasons.test.ts` (singular, plural, string intacto, tipos no válidos) — coherente con la decisión de H2 de no usar `fake-indexeddb`.

**Preview en hover del `Rating` (modo input)**
El `Rating` ya rellenaba de la estrella 1 a la clicada (`star <= value`). Se añadió previsualización en hover: un estado local `hovered` y `displayValue = hovered ?? value` hacen que, al pasar el ratón, las estrellas se pinten en amarillo hasta la apuntada antes de confirmar el clic; `onMouseLeave` del contenedor resetea a `null` para volver al valor real. Solo afecta al modo input — el modo `readOnly` no tiene estado de hover. Sin cambios en `SeriesForm`, que ya consumía el componente vía `Controller`. La accesibilidad (radios + labels `sr-only`) se mantiene intacta.

**`.sr-only` no estaba definido — radios y números visibles en el `Rating`**
El `Rating` (modo input) usa `<input type="radio" className="sr-only">` para la semántica de grupo y un `<span className="sr-only">{star}</span>` con el número, ambos pensados para quedar ocultos visualmente. La clase `.sr-only` no estaba definida en ningún `.scss` global, por lo que se veían los "topos" de los radios nativos y los números junto a cada estrella, dando un aspecto pobre. Solución: definir la utilidad `.sr-only` (patrón clip estándar) en `styles/global.scss`. Era el único consumidor de la clase, así que el cambio no afecta a nada más. Resultado: en el formulario solo se ven las 5 estrellas.

**Mejora visual de las estrellas del `Rating`**
Junto con el fix de `.sr-only`: estrellas más grandes (`--font-size-2xl`), `gap` por token (`--space-1`), transición de color suave en `.filled`/`.empty`, hover con `scale(1.2)` y feedback de `:active` con `scale(0.95)`, y el outline de foco usando `--radius-sm`. El amarillo pasó a `#f5b50a`. No se muestran números ni controles: solo las estrellas (el clic en la 5ª implica rating 5).

**Fix layout grid de `SeriesListPage` (cards de altura uniforme)**
Con 120 series y títulos de longitud variable, las cards de una misma fila tenían alturas distintas y algunas quedaban cortadas u ocultas. Causas y solución:
- `<li>` no transfería su altura al `SeriesCard` interior: se añadió `li { display: flex }` dentro de `.grid`.
- `grid-auto-rows: 1fr` en `.grid` iguala la altura de todas las filas.
- `.card` pasó a `display: flex; flex-direction: column; width: 100%` para distribuir portada e info verticalmente.
- `.cover` recibió `flex-shrink: 0` para no encogerse al ser la card más alta que lo que pide su `aspect-ratio`.
- `.info` recibió `flex: 1` para ocupar el espacio restante; `.year` usa `margin-top: auto` para anclarse al fondo.
- `.title` pasó de `white-space: nowrap + text-overflow: ellipsis` (una sola línea) a `-webkit-line-clamp: 2` (dos líneas máximo), evitando que títulos largos rompan la alineación del grid.
- Breakpoints de columnas ajustados: 2 móvil / 3 tablet / 4 desde 1024px / 5 desde 1280px (antes saltaba directo a 5 en desktop, demasiado estrecho para títulos largos).

**Fixes y mejoras del Dashboard (post H9)**

1. **Géneros en el seed inferidos por palabras clave.** `seed.ts` añade la función `inferGenres(entry)` que analiza título + sinopsis con 13 reglas regex y asigna hasta 3 géneros del union `Genre`. Si ninguna regla encaja, la serie cae en `'Drama'`. La función usa un `Set` para evitar duplicados y hace break al llegar a 3. Esto resuelve el `genreDistribution` vacío que hacía el gráfico invisible.

2. **Tooltip de Recharts tematizado.** Ambos `BarChart` (`GenreDistributionChart` y `RatingDistributionChart`) usaban `<Tooltip />` sin props, lo que renderizaba un popup con fondo blanco duro que chocaba con cualquier tema oscuro. Se añade `contentStyle`, `cursor`, `itemStyle` y `labelStyle` usando CSS variables (`--color-surface`, `--color-border`, `--color-text`, `--color-text-muted`). Los valores se pasan como objetos inline — Recharts no consume CSS vars directamente sin este puente.

3. **Nuevo gráfico de quesito `GenrePieChart`.** Componente `src/components/features/dashboard/GenrePieChart/` con `PieChart`, `Pie` (donut: `innerRadius=40`, `outerRadius=90`), `Cell` (paleta de 10 colores fijos), `Tooltip` tematizado y `Legend`. Consume los mismos datos `GenreCount[]` que `GenreDistributionChart`. Añadido a `DashboardPage` en tercer lugar del `chartGrid`.

4. **Estado vacío en `GenreDistributionChart`.** Si `data.length === 0` renderiza el mensaje `MESSAGES.dashboard.noData` en lugar del `BarChart` (evita un gráfico de ejes vacíos).

5. **Nuevas claves en `MESSAGES.dashboard`:** `genrePieChart` y `noData`.

---

## H10 — Métricas de duración + géneros editables · Complejidad: M ✅

- **Estado:** ✅ Completado.
- **Objetivo:** Enriquecer el dashboard con la dimensión "tipo de serie por duración" (miniserie vs. serie multi-temporada) y permitir ampliar el catálogo de géneros desde el formulario de alta/edición.
- **Entregable:** dashboard con 2 KPI cards nuevas (miniseries / multi-temporada) y un gráfico de la distribución por tipo de duración; input de géneros del `SeriesForm` capaz de añadir géneros nuevos a la lista seleccionable; rediseño visual de todas las cards del dashboard con iconos y estilo más atractivo.
- **Dependencias:** H5 (dashboard), H9 (`seasons` es texto libre), H4 (`SeriesForm` + `seriesSchema`).

### Decisiones a confirmar antes de implementar

1. **Clasificación de "miniserie" desde `seasons` (texto libre).** `Series.seasons` es `string` desde H9, sin recuento numérico fiable. Propuesta: helper puro `classifySeasons(seasons: string): 'miniserie' | 'single' | 'multi'` en `utils/`:
   - `miniserie` si el texto matchea `/miniserie/i`.
   - en otro caso, extraer el primer número del texto: `=== 1` → `single` (una temporada), `> 1` → `multi`.
   - sin número ni match → fallback a confirmar (`single` o "desconocido").
   *Pendiente de validar contra los datos reales de `seed.json`.*
2. **"Más de una temporada"** = `classifySeasons() === 'multi'`. Confirmar si las miniseries cuentan aparte (propuesta: sí, las tres categorías son excluyentes).
3. **Géneros editables (punto 3).** `Genre` es hoy un *union* cerrado de TS. Permitir añadir géneros nuevos exige una decisión:
   - **(A)** Aflojar el tipo a `string[]` y persistir los géneros conocidos en una fuente dinámica (tabla Dexie `genres` o `localStorage`), alimentando el multi-select.
   - **(B)** Mantener el union para los predefinidos y permitir solo "custom genres" por serie (string libre), sin catálogo global.
   - Propuesta: **(A)** con `localStorage` (`tv-shows:custom-genres`) en Fase 1, migrable a tabla Dexie en Fase 2. Confirmar.

### Tareas

1. **Métricas de duración en `useDashboardMetrics`:**
   - Añadir al hook el cálculo de `miniseriesCount`, `multiSeasonCount` y `singleSeasonCount` usando `classifySeasons` sobre `series[].seasons`.
   - Exponer también el array `durationDistribution: { type, count }[]` para el gráfico.

2. **2 KPI cards nuevas (parte superior del dashboard):**
   - Reutilizar `KPICard` (de H5). Una card "Miniseries" (`miniseriesCount`) y otra "Multi-temporada" (`multiSeasonCount`).
   - Colocarlas junto a las KPI existentes (Total / Destacadas) en la fila superior.

3. **Gráfico nuevo de distribución por duración:**
   - Nuevo componente `features/dashboard/DurationDistributionChart/` con Recharts (tipo a confirmar: `BarChart` o `PieChart` donut, coherente con los existentes).
   - Tooltip tematizado con CSS vars (mismo puente que `GenreDistributionChart`/`GenrePieChart`).
   - Estado vacío (`MESSAGES.dashboard.noData`) si no hay datos.
   - Montar en `DashboardPage` dentro del `chartGrid`.

4. **Géneros editables en `SeriesForm` (punto 3):**
   - Convertir el multi-select de géneros en un control "creatable": permitir escribir un género nuevo y añadirlo a la lista de opciones seleccionables además de seleccionarlo.
   - Según decisión 3: persistir el nuevo género (catálogo dinámico) y normalizar (trim, evitar duplicados case-insensitive).
   - Ajustar `seriesSchema.ts` si cambia el tipo de `genres` (de union a `string[]` validado no vacío).
   - Sin librería nueva sin aprobación previa (regla del proyecto).

5. **Rediseño visual de las cards del dashboard (iconos + estilo más atractivo):**
   - Añadir un icono representativo a cada KPI card (total, destacadas, miniseries, multi-temporada). SVG inline, sin librería de iconos (coherente con el criterio de H9 para el toggle de tema).
   - Modificar `KPICard` para aceptar una prop opcional de icono y renderizarlo junto al valor/label, manteniendo la API actual retrocompatible.
   - Mejorar el estilo de **todas** las cards del dashboard (las KPI superiores y los contenedores de los gráficos): jerarquía visual del número vs. label, color de acento del icono por card (vía tokens de tema), `box-shadow`/`border-radius`/`padding` consistentes, hover sutil, y buen contraste en los 8 combos de tema.
   - Las cards de gráficos (`GenreDistributionChart`, `RatingDistributionChart`, `GenrePieChart`, `DurationDistributionChart`) comparten el mismo contenedor visual: añadir un encabezado con icono + título coherente entre ellas.
   - Mantener la accesibilidad: iconos decorativos con `aria-hidden="true"`; el texto de la card sigue siendo el contenido accesible.
   - Sin romper el layout responsive de `DashboardPage`.

### Archivos
- `src/hooks/useDashboardMetrics.ts` (ampliar).
- `src/utils/classifySeasons.ts` (nuevo) + `classifySeasons.test.ts`.
- `src/components/features/dashboard/DurationDistributionChart/` (nuevo).
- `src/components/features/dashboard/KPICard/` (modificar — prop de icono + estilo).
- `src/components/features/dashboard/{GenreDistributionChart,RatingDistributionChart,GenrePieChart}/` (modificar — encabezado con icono + contenedor visual común).
- `src/pages/DashboardPage/` (montar cards + gráfico; ajustar estilos del grid).
- `src/components/features/SeriesForm/` (input de géneros creatable).
- `src/utils/seriesSchema.ts` (si cambia el tipo de `genres`).
- `src/types/series.ts` / `src/types/genre.ts` (si se afloja el union `Genre`).
- `src/constants/messages.ts` (labels de las cards, título del gráfico).
- Fuente del catálogo de géneros (decisión 3): `localStorage` helper o tabla Dexie.

### Tests
- `classifySeasons`: tabla de casos (miniserie, "1 temporada", "5 temporadas", texto sin número, vacío).
- `useDashboardMetrics`: nuevos counts y `durationDistribution` sobre datos de prueba.
- `DurationDistributionChart`: render con datos y estado vacío.
- `DashboardPage`: aparecen las 2 KPI nuevas con los valores correctos.
- `SeriesForm`: añadir un género nuevo lo agrega a las opciones y queda seleccionado; submit lo incluye en `genres`; no se duplica.
- `KPICard`: renderiza el icono cuando se pasa la prop y mantiene el render previo cuando no (retrocompatibilidad); el icono es decorativo (`aria-hidden`).

### Hecho cuando
- El dashboard muestra, arriba, las cards "Miniseries" y "Multi-temporada" con los recuentos correctos.
- Hay un gráfico nuevo con la distribución por tipo de duración, reactivo a cambios en la BD.
- En crear/editar serie puedes escribir un género que no existía, añadirlo y guardarlo en la serie.
- Todas las cards del dashboard (KPI y gráficos) muestran icono y un estilo renovado, coherente y atractivo en los 8 combos de tema, sin romper el responsive.

### Notas de implementación

**Decisiones tomadas (las 3 abiertas + el tipo de gráfico)**
- **Géneros: opción A.** `Genre` pasó de union cerrado a `type Genre = string`. Catálogo dinámico en `localStorage` (`tv-shows:custom-genres`) vía `utils/genresCatalog.ts` (`getAllGenres`, `getCustomGenres`, `addCustomGenre`), que fusiona predefinidos + personalizados sin duplicados case-insensitive. `seriesSchema` cambió de `z.enum(GENRES)` a `z.array(z.string().min(1)).min(1)`.
- **Iconos: SVG inline propios** en `components/features/dashboard/icons.tsx` (sin librería). `currentColor` + `aria-hidden`.
- **Gráfico de duración: donut** (`PieChart` con `innerRadius`, mismo patrón que `GenrePieChart`). `components/features/dashboard/DurationDistributionChart/`. (Inicialmente un `RadialBarChart`; cambiado a donut a petición.)

**Heurística `classifySeasons` (`utils/classifySeasons.ts`)**
`miniserie | single | multi` sobre el texto libre `seasons`. Orden: si contiene "miniserie" → `miniserie`; si hay un número asociado a "season/temporada" (`/(\d+)\s*ª?\s*(?:season|temporada)/`) → `multi` si >1, `single` si =1; resto → `single`. El regex ancla el número a la palabra de temporada para no contar episodios (ej. "Primera temporada - 8 episodios" → `single`, no cuenta el 8). Validado contra los valores reales de `seed.json`.

**`KPICard` retrocompatible**
Props nuevas opcionales `icon?: ReactNode` y `accent?: string` (color de acento vía CSS var `--kpi-accent` + `color-mix` para el fondo del icono). Sin icono, el render previo se mantiene. Restyle: layout en fila icono+texto, franja de acento, hover con `translateY`/`shadow`.

**Cards de gráficos con encabezado de icono**
`GenreDistributionChart`, `RatingDistributionChart`, `GenrePieChart` y `DurationDistributionChart` comparten un `.header` (icono + título) con estilo coherente.

**`aria-label` distintos en los botones "Añadir" del `SeriesForm`**
Al añadir el botón de crear género (texto "Añadir", igual que el de reparto), `getByRole('button', { name: /añadir/i })` se volvía ambiguo. Solución: `aria-label="Añadir reparto"` y `aria-label="Añadir género"`; el input de reparto mantiene `"Añadir miembro del reparto"` (distinto del botón para no romper `getByLabelText`).

**Filtro de género del listado**
`SeriesListPage` construye sus opciones con `getAllGenres()` (en `useMemo`), de modo que los géneros personalizados también son filtrables.

**Orden del `chartGrid`**
A petición, el orden final de los gráficos es: 1) Distribución por género (barras), 2) **Series por género (donut)**, 3) Distribución por valoración (barras), 4) Distribución por duración (donut). Solo cambia el orden de render en `DashboardPage`.

**Mejora del `ThemeToggle` (icono claro/oscuro)**
Las dos bombillas casi idénticas se sustituyeron por **sol** (modo claro) y **luna** (modo oscuro), con color propio fijo e independiente del tema (sol `#f5b50a`, luna `#818cf8`) para diferenciarlos al máximo. La transición pasó de un simple fundido a rotación (−90°→0) + escala (0.3→1) con easing tipo spring (`cubic-bezier(0.34, 1.56, 0.64, 1)`). Accesibilidad intacta: SVG `aria-hidden`, `aria-label`/`title` dinámicos en el botón. Los SVG son inline (sin librería), coherente con el criterio de iconos del proyecto.

**Tests**
+10 tests nuevos (classifySeasons, genresCatalog, métricas de duración, KPICard con icono, DurationDistributionChart, género nuevo en SeriesForm). Suite completa en verde (301), lint y `tsc -b` limpios, `pnpm build` OK.

---

## H11 — Pegar portada desde el portapapeles · Complejidad: S ✅

- **Estado:** ✅ Completado.
- **Objetivo:** Permitir adjuntar la portada de una serie pegando una imagen copiada de otra web (clic derecho → "Copiar imagen"), sin necesidad de descargarla a disco primero.
- **Entregable:** en el `SeriesForm`, una zona dedicada donde pegar (`Ctrl/Cmd+V`) una imagen del portapapeles; el `<input type="file">` actual se mantiene como método alternativo.
- **Dependencias:** H4 (`SeriesForm`, validación de imagen y `imageService`).

### Decisiones tomadas (acordadas antes de implementar)

1. **Solo bitmap del portapapeles.** Se soporta únicamente el caso en que el `ClipboardEvent` trae los bytes de la imagen (`clipboardData.items` con un item de tipo `image/*` → `getAsFile()` devuelve un `File`/`Blob`). **No** se soporta pegar una URL de imagen como texto: evita el `fetch` remoto y todos los problemas de CORS, y reutiliza tal cual la validación y el almacenamiento de Blob existentes.
2. **El input file se mantiene como fallback.** El paste es el método nuevo y principal, pero el `<input type="file">` actual sigue presente para los casos sin imagen en el portapapeles (móvil, subida desde disco, etc.).
3. **Captura en zona dedicada (dropzone), no a nivel de documento.** Un área visible y enfocable (`tabIndex={0}`) con `onPaste`. Pegar solo surte efecto dentro de esa zona, evitando interferir con el pegado de texto en otros campos del formulario (sinopsis, opinión, etc.).

### Tareas

1. **Zona de pegado en `SeriesForm`:**
   - Nuevo elemento enfocable (`tabIndex={0}`, `role="button"` o equivalente) dentro del `FormField` de portada, con copy tipo "Pega aquí una imagen (Ctrl/Cmd+V)".
   - Handler `onPaste` que recorre `e.clipboardData.items`, localiza el primer item con `type` que empiece por `image/` y obtiene el `File` vía `getAsFile()`.
   - Si no hay imagen en el paste (p. ej. se pegó texto), mostrar el mensaje de error correspondiente sin romper.
2. **Reutilizar la validación existente:**
   - Extraer la lógica de `handleFileChange` (validación de MIME ∈ {jpeg, png, webp} + tamaño ≤ 2 MB + creación/revocación de `ObjectURL` + `setImageFile`/`setImagePreview`) a un helper común (`processImageFile(file)`), consumido tanto por el input file como por el paste. El Blob pegado pasa exactamente por las mismas reglas; la persistencia vía `imageService` no cambia.
3. **Mantener el input file como fallback** debajo o junto a la dropzone, sin cambios de comportamiento.
4. **Mensajería centralizada:** añadir a `constants/messages.ts` las claves nuevas (instrucción de pegar, error "el portapapeles no contiene una imagen"). Reutilizar `errors.imageType`/`errors.imageSize` para las validaciones ya existentes.
5. **Accesibilidad:** la dropzone es operable por teclado (enfocable + pegar con `Ctrl/Cmd+V`); preview con `alt` ya existente; sin perder el `aria-label` del input file.

### Archivos
- `src/components/features/SeriesForm/SeriesForm.tsx` (modificar — dropzone + handler `onPaste` + extracción de `processImageFile`).
- `src/components/features/SeriesForm/SeriesForm.module.scss` (estilos de la dropzone).
- `src/constants/messages.ts` (copy de la zona de pegado + error de portapapeles sin imagen).

### Tests
- `SeriesForm`: pegar un `ClipboardEvent` con un item `image/png` válido genera preview y deja el archivo listo para submit.
- `SeriesForm`: pegar contenido sin imagen (solo texto) muestra el error de "portapapeles sin imagen" y no toca el preview.
- `SeriesForm`: una imagen pegada que excede 2 MB o con MIME no permitido dispara `errors.imageSize` / `errors.imageType` (misma ruta que el input file).
- `SeriesForm`: el input file sigue funcionando como antes (no regresión).

### Hecho cuando
- En crear/editar serie puedes copiar una imagen de otra web y pegarla en la zona dedicada del formulario, ver el preview y guardar la serie con esa portada.
- Pegar algo que no es una imagen muestra un error claro sin romper el formulario.
- El input file sigue disponible como alternativa.

### Notas de implementación

**`processImageFile` compartido entre input file y paste**
La lógica de `handleFileChange` (validación MIME + tamaño, revocación/creación de `ObjectURL`, `setImageFile`/`setImagePreview`) se extrajo a `processImageFile(file: File)`. Tanto `handleFileChange` como el nuevo `handlePaste` la invocan, así que el Blob pegado pasa por exactamente las mismas reglas que un archivo subido y la persistencia vía `imageService` no cambia.

**`handlePaste` solo bitmap**
Recorre `e.clipboardData.items`, busca el primer item con `type` que empiece por `image/` y obtiene el `File` con `getAsFile()`. Si no hay imagen (p. ej. se pegó texto) muestra `errors.clipboardNoImage` y no toca el preview. `e.preventDefault()` solo se llama cuando hay imagen, para no bloquear el pegado de texto en otros contextos.

**Dropzone enfocable, no listener global**
La zona de pegado es un `<div role="button" tabIndex={0}>` con `onPaste`; el paste solo surte efecto dentro de ella. Estilo `dashed` con feedback en `:hover`/`:focus-visible` vía tokens. El `<input type="file">` se mantiene debajo como fallback sin cambios.

**Mock de `URL.createObjectURL` en el test**
jsdom no implementa `createObjectURL`/`revokeObjectURL`. Los tests previos no los disparaban (rechazaban archivos inválidos antes de crear la URL); el test de paste válido sí llega a crear preview, así que se mockean ambos en el `beforeEach` del archivo. Helper `clipboardWith()` construye un `clipboardData` falso (`items` con `getAsFile`) para `fireEvent.paste`. +3 tests (paste válido, paste sin imagen, paste con MIME no válido). Suite en verde (308), lint y `tsc -b` limpios.

**Reubicación y layout del campo de portada (ajuste posterior)**
A petición, el `FormField` de portada se movió al principio del formulario, **por encima del título**. El layout de `.imageField` pasó de columna a fila (`flex-direction: row`): el preview (o un placeholder `dashed` 160×220 cuando aún no hay imagen) queda a la izquierda y los controles (zona de paste + hint + input file) en una columna `.imageControls` a la derecha, ocupando el espacio restante (`flex: 1`). La zona de paste crece para igualar la altura del preview (`flex: 1`). En móvil (`max-width: 600px`) vuelve a apilarse en columna. El preview se renderiza siempre (placeholder cuando `imagePreview` es null) para mantener estable la composición lado a lado.

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
| H10 Métricas duración + géneros editables | H5, H9, H4 | M |
| H11 Pegar portada desde el portapapeles | H4 | S |

> H5 y H6 son paralelizables entre sí (ambos dependen solo de H3/H4), pero H5 necesita H4 para validar reactividad. H6 puede empezarse en cuanto H3 esté hecho. H8 cierra el plan — depende de H7 para tener el diseño pulido y las portadas del seed completas.

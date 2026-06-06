# PRD — Fase 1: TV Shows Manager

> Documento de requisitos para la Fase 1 del proyecto. Frontend-only con persistencia local.
> Las fases posteriores cubrirán backend, base de datos remota, hosting, upload de imágenes desde dispositivo, comentarios de Viewers, autenticación real, internacionalización y métricas adicionales.

---

## 1. Resumen

SPA en React 19 + TypeScript para gestionar una colección personal de series favoritas (ya vistas). Incluye listado, dashboard con métricas, CRUD completo de series, sistema de roles, múltiples temas visuales con modo claro/oscuro y diseño responsive.

**Audiencia:** uso personal, número muy pequeño de usuarios.

**Alcance Fase 1:** todo el frontend funcional con persistencia local. Sin backend.

---

## 2. Stack técnico

| Área | Tecnología |
|---|---|
| Framework | React 19 + Vite |
| Lenguaje | TypeScript (sin `any`, sin `@ts-ignore` injustificado) |
| Gestor de paquetes | **pnpm** (no npm, no yarn) |
| Routing | React Router v6 |
| Estilos | SASS scoped por componente + CSS variables para theming |
| Formularios | React Hook Form + Zod |
| Gráficos | Recharts |
| Persistencia | IndexedDB (Dexie) para datos de negocio + localStorage para preferencias UI |
| Testing | Vitest + React Testing Library |

> Todos los comandos de instalación, ejecución y scripts deben usar `pnpm`. El repositorio debe incluir `pnpm-lock.yaml` (no `package-lock.json` ni `yarn.lock`).

---

## 3. Roles y autenticación

### Roles

| Rol | Login | Permisos |
|---|---|---|
| **Viewer** | No | Solo lectura. Acceso público por defecto al abrir la app. |
| **User** | Sí | CRUD sobre series propias. No gestiona usuarios. |
| **Admin** | Sí | CRUD sobre todas las series. Gestión de usuarios. |

### Matriz de permisos

| Acción | Viewer | User | Admin |
|---|---|---|---|
| Ver listado y detalle de series | ✓ | ✓ | ✓ |
| Ver dashboard y métricas | ✓ | ✓ | ✓ |
| Crear serie | ✗ | ✓ | ✓ |
| Editar serie | ✗ | solo las propias | todas |
| Eliminar serie | ✗ | solo las propias | todas |
| Crear/editar/eliminar usuarios | ✗ | ✗ | ✓ |

### Reglas de auth (Fase 1)

- Sin registro público. Solo el Admin da de alta nuevos usuarios (rol User o Admin).
- Acceso por defecto a la app como Viewer (sin login).
- Login accesible desde un botón en el header.
- Rutas protegidas mediante guard (`<ProtectedRoute>`), preparado para integrar auth real en Fase 2/3.
- La sesión activa se persiste en localStorage (token simulado + datos del user logueado).

### Seed inicial de usuarios

Al primer arranque, si la BD está vacía, se cargan:

- 1 usuario **Admin**: `admin@local` / `admin`
- 1 usuario **User**: `user@local` / `user`

---

## 4. Modelo de datos

### Entidad `Series`

```ts
interface Series {
  id: string;            // uuid
  coverImage: string;    // referencia al Blob en IndexedDB
  title: string;         // requerido
  synopsis: string;      // requerido
  seasons: number;       // requerido, > 0
  cast: string[];        // array de strings (input tipo tags/chips)
  year: number;          // requerido, año válido (1900 - año actual)
  opinion?: string;      // opcional
  rating: number;        // requerido, entero 1-5
  genres: Genre[];       // requerido, mínimo 1, múltiple
  createdBy: string;     // id del User que la creó
  createdAt: string;     // ISO
  updatedAt: string;     // ISO
}
```

### Géneros (lista cerrada)

```ts
type Genre =
  | 'Drama'
  | 'Comedia'
  | 'Thriller'
  | 'Ciencia ficción'
  | 'Fantasía'
  | 'Documental'
  | 'Animación'
  | 'Acción'
  | 'Romance'
  | 'Terror';
```

### Entidad `User`

```ts
interface User {
  id: string;
  email: string;        // único
  password: string;     // hash simulado en Fase 1
  role: 'admin' | 'user';
  createdAt: string;
}
```

> Nota: el rol Viewer no se almacena. Es el estado por defecto cuando no hay sesión activa.

---

## 5. Funcionalidades

### 5.1 Listado de series

- Vista en grid con cards (portada + título + año + rating).
- Click en card → vista de detalle.
- Filtros básicos: por género, por rating.
- Búsqueda por título.
- Responsive: 1 columna en móvil, 2 en tablet, 3-4 en desktop.

### 5.2 Detalle de serie

- Portada, título, año, rating (estrellas), géneros, sinopsis, reparto, opinión, temporadas.
- Botones de editar/eliminar visibles solo si el usuario tiene permiso (User dueño o Admin).
- Acción "Eliminar" requiere confirmación.

### 5.3 Crear / editar serie

- Mismo formulario para crear y editar.
- Campos según el modelo. Validación con Zod:
  - `title`, `synopsis`, `seasons`, `year`, `rating`, `genres`, `coverImage`: requeridos.
  - `cast`: opcional, pero si se rellena debe ser un array no vacío.
  - `opinion`: opcional.
  - `rating`: entero entre 1 y 5.
  - `year`: entero entre 1900 y el año actual.
  - `seasons`: entero positivo.
- Input de imagen de portada:
  - En Fase 1: input file que acepta `image/jpeg`, `image/png`, `image/webp`. Se almacena como Blob en IndexedDB.
  - Tamaño máximo recomendado: 2 MB por imagen.
- Componente de selección de géneros: multi-select sobre la lista cerrada.
- Input de reparto: tags/chips (añadir/quitar nombres).

### 5.4 Dashboard

Métricas mostradas como gráficos Recharts con animaciones y paleta del tema activo:

1. **Total de series** (KPI numérico).
2. **Series destacadas** (KPI numérico): cuenta de series con `rating >= 4`.
3. **Distribución por género** (gráfico de barras o donut). Una serie con varios géneros cuenta una vez por cada uno.
4. **Distribución por rating** (gráfico de barras): cuántas series hay con rating 1, 2, 3, 4, 5.

### 5.5 Gestión de usuarios (solo Admin)

- Listado de usuarios existentes con su rol.
- Crear nuevo usuario (email, password, rol).
- Editar usuario (cambiar rol o resetear password).
- Eliminar usuario (con confirmación; no se puede eliminar al propio usuario logueado).

### 5.6 Sistema de temas

- **4 temas predefinidos**, cada uno con versión clara y oscura (8 combinaciones totales):
  - `default` (neutro, base del sistema)
  - `ocean` (azules y turquesas)
  - `sunset` (naranjas y magentas)
  - `forest` (verdes y tierras)
- Implementación basada en variables CSS con tokens semánticos (`--color-bg`, `--color-text`, `--color-primary`, `--color-surface`, etc.).
- Selector compuesto: `[data-theme="ocean"][data-mode="dark"]`.
- `ThemeContext` gestiona `{ theme, mode }`.
- Persistencia en localStorage. Primer render respeta `prefers-color-scheme` para el modo.
- Selector accesible desde un dropdown en el header (tema + modo).

### 5.7 Responsive

- Breakpoints estándar: móvil (<768px), tablet (768-1024px), desktop (>1024px).
- Navegación adaptada: menú hamburguesa en móvil, barra completa en desktop.

---

## 6. Estructura de carpetas

```
src/
  components/
    ui/              # Componentes presentacionales puros (Button, Input, Card, Modal, Tag...)
    features/        # Componentes con lógica (SeriesForm, SeriesList, UserManager, ThemeSelector...)
    layout/          # Header, Sidebar, Layout, ProtectedRoute
  pages/             # Una por ruta (Dashboard, SeriesListPage, SeriesDetailPage, SeriesFormPage, LoginPage, UsersPage)
  hooks/             # useAuth, useTheme, useSeries, useUsers...
  services/          # seriesService, usersService, authService (interfaces estables para Fase 2)
  context/           # AuthContext, ThemeContext
  types/             # Series, User, Genre, Theme...
  utils/
  constants/         # Textos UI en castellano, listas (géneros, temas)
  styles/            # Reset, variables base, mixins, themes/
  db/                # Dexie schema + seed inicial
```

---

## 7. Rutas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Público | Redirige a `/series` |
| `/series` | Público | Listado de series |
| `/series/:id` | Público | Detalle de una serie |
| `/series/new` | User, Admin | Crear nueva serie |
| `/series/:id/edit` | User dueño, Admin | Editar serie |
| `/dashboard` | Público | Dashboard con métricas |
| `/login` | Público | Pantalla de login |
| `/users` | Admin | Gestión de usuarios |
| `*` | Público | 404 |

---

## 8. Capa de servicios

Toda comunicación con la persistencia pasa por `/src/services/`. En Fase 1 estos servicios leen/escriben en Dexie. En Fase 2 se sustituye la implementación interna por llamadas HTTP, manteniendo la misma firma pública.

Servicios mínimos:

- `seriesService`: `getAll`, `getById`, `create`, `update`, `remove`.
- `usersService`: `getAll`, `getById`, `create`, `update`, `remove`.
- `authService`: `login`, `logout`, `getCurrentUser`.
- `imageService`: `save(blob) → id`, `get(id) → blob`, `remove(id)`. (Wrap sobre Dexie para imágenes.)

Todos los métodos devuelven `Promise<T>` (aunque la operación sea síncrona) para que la migración a HTTP no requiera cambios en consumidores.

---

## 9. Testing

- Vitest + React Testing Library.
- Cada componente con su test file (`Component.test.tsx`).
- Cobertura mínima esperada en Fase 1: componentes UI base, servicios (lógica de negocio), hooks personalizados, guards de rutas.
- Tests de comportamiento, no de implementación.

---

## 10. Internacionalización (preparación)

- UI en castellano en Fase 1.
- Todos los textos visibles centralizados en `/src/constants/` (por ejemplo `messages.ts`) para facilitar migración a `i18next` en fases posteriores.

---

## 11. Fuera del alcance de Fase 1

Se documenta explícitamente para evitar scope creep:

- Backend real, BD remota, hosting.
- Autenticación real (JWT/OAuth).
- Hash real de passwords.
- Comentarios de Viewers sobre series.
- Métricas adicionales (peor valoradas, series por año, etc.).
- Upload de imagen desde URL externa.
- Internacionalización funcional (multi-idioma).
- Notificaciones, exportación de datos, compartir.

---

## 12. Criterios de aceptación Fase 1

- [ ] Un Viewer puede entrar sin login y ver listado, detalle y dashboard.
- [ ] Un User puede loguearse, crear series, editar/eliminar las suyas y no las ajenas.
- [ ] Un Admin puede hacer todo lo anterior + editar/eliminar cualquier serie + gestionar usuarios.
- [ ] El formulario de serie valida correctamente con Zod y muestra errores comprensibles.
- [ ] Las imágenes se almacenan en IndexedDB y se recuperan correctamente al recargar.
- [ ] El dashboard refleja las 4 métricas en tiempo real al añadir/quitar series.
- [ ] El selector de tema cambia los 4 temas × 2 modos sin recarga, persistiendo la selección.
- [ ] La app es navegable y usable en móvil, tablet y desktop.
- [ ] Todos los componentes tienen su test file y los tests pasan en verde.
- [ ] Lint y tests pasan antes de cada commit.

# Convenciones SCSS / CSS-modules

## Scoped por defecto, global casi nunca

Cada componente tiene su `.module.scss` con estilos **scoped**. Lo único que vive global:

- **Tokens** (`styles/themes/_tokens.scss`): las CSS variables.
- **Reset** y base mínima.
- **Utilidades** muy puntuales en `styles/global.scss` (p. ej. `.sr-only`). No abuses: si una utilidad solo la usa un componente, va en su módulo.

No metas estilos de componente en global. No crees clases "globales de ayuda" para un solo sitio.

## Importar tokens / mixins en un módulo

Los `.module.scss` consumen las CSS variables directamente como `var(--token)` (las variables son globales en cascada, no hace falta `@use` para ellas). Si hay mixins/funciones SCSS compartidos, impórtalos con `@use` (no el `@import` deprecado).

## Breakpoints (mobile-first)

El grid del listado usa esta progresión de columnas, úsala como referencia de breakpoints del proyecto:

- móvil: 2 col
- tablet: 3 col
- ≥1024px: 4 col
- ≥1280px: 5 col

Escribe mobile-first (estilos base = móvil, `min-width` para subir). En formularios, el patrón es apilar en móvil (`max-width: 600px`) y pasar a fila/columnas en pantallas mayores.

## Patrones de layout ya establecidos (respétalos)

- **Grid de cards de altura uniforme:** `.grid { display:grid; grid-auto-rows:1fr }`, los `<li>` con `display:flex`, la card con `display:flex; flex-direction:column; width:100%`, `.cover { flex-shrink:0 }`, `.info { flex:1 }`, y el último meta con `margin-top:auto`. Títulos a 2 líneas con `-webkit-line-clamp: 2` (no `nowrap+ellipsis`, que rompe la alineación).
- **Imágenes como assets importados** en TS (`import x from '@/assets/x.webp'`), no `background-image: url()` en SCSS (la ruta relativa no resuelve fiable). Vite procesa el import.

## Testing de estilos (regla firme)

- **No testees nombres de clase de CSS-modules.** El hash transforma `hoverable` en `_hoverable_<hash>`. Usa `expect(el.className).toMatch(/hoverable/)` o, mejor, **testea comportamiento o presencia accesible**, no la clase.
- Con `css: true` en Vitest, jsdom computa `display:none` de las media queries: elementos ocultos no salen en el árbol accesible. Usa `getByRole(..., { hidden: true })` cuando verifiques existencia de algo oculto por CSS.
- Imágenes decorativas (`alt=""`, padre `aria-hidden`) tienen role `presentation`, no `img`: búscalas con `container.querySelectorAll('img')`.

## Anti-patrones a evitar

- Hardcodear color/espaciado/sombra en un módulo (rompe temas). → usa tokens.
- `useEffect` para estilos derivables en render. → calcula en render.
- Estilos globales para algo de un solo componente.
- Tests acoplados a clases hash.

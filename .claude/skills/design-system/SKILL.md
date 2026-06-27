---
name: design-system
description: >-
  Sistema de diseño del proyecto tvshows_site (React 19 + SASS/CSS-modules + tokens
  semánticos con temas multi-modo). Úsala SIEMPRE que se cree o modifique UI, estilos,
  componentes, vistas, formularios, temas o paletas de color, aunque no se mencione
  "design system" explícitamente: maquetar una pantalla, estilar un componente de
  components/ui o features/, tocar SCSS/CSS-modules, añadir o ajustar un tema, elegir
  colores, espaciado, tipografía, sombras o radios, trabajar contraste/accesibilidad,
  o conectar colores de tema a Recharts. Codifica los tokens reales, el patrón
  [data-theme][data-mode], las convenciones CSS-modules del proyecto y las reglas a11y,
  para no reinventar el SCSS ni romper la coherencia entre los temas.
---

# Design System — tvshows_site

Guía operativa para producir UI coherente en este proyecto. La estética la aporta el criterio; esta skill garantiza que **todo el estilado pase por la capa de tokens** y respete las convenciones del proyecto, de modo que un cambio mejore todos los temas a la vez y nada rompa los demás.

## Regla de oro: tokens-first

**Nunca hardcodees valores de color, espaciado, radio, sombra o tipografía en un componente.** Usa siempre las CSS variables semánticas. Un color hardcodeado solo funciona en un tema y rompe en los otros 7. Si necesitas un valor que no existe como token, **añádelo a la capa de tokens**, no al componente.

- Colores → `var(--color-*)` (ver `references/tokens.md`).
- Espaciado → `var(--space-1..8)`. Tipografía → `var(--font-*)`. Radios → `var(--radius-*)`. Sombras → `var(--shadow-*)`.
- La **fuente de verdad** de los tokens es `src/styles/themes/_tokens.scss`. Si esta skill y el SCSS divergen, **manda el SCSS**.

## Cuándo leer cada referencia

Lee solo la que necesites para la tarea:

- **`references/tokens.md`** — inventario completo de tokens (cromáticos por tema + no cromáticos compartidos), qué significa cada uno y los tokens estructurales que el rediseño introduce (elevación, foco, hover). Léela antes de estilar cualquier componente o de tocar `_tokens.scss`.
- **`references/theming.md`** — el patrón `[data-theme][data-mode]`, cómo añadir un tema nuevo sin tocar consumidores, y el puente para pasar tokens a Recharts. Léela al añadir/editar temas o al colorear gráficos.
- **`references/scss-conventions.md`** — reglas de CSS-modules, qué va global y qué no, breakpoints, y cómo (no) testear estilos. Léela antes de escribir cualquier `.module.scss` o test de componente con estilo.
- **`references/accessibility.md`** — foco visible, `.sr-only`, contraste objetivo, patrones ARIA del proyecto. Léela al maquetar interactivos, formularios o al elegir colores.

## Reglas duras del proyecto (no negociables)

Estas vienen de `CONTEXT.md`/`PROFILE.md` y aplican a todo trabajo visual:

1. **Sin librerías nuevas sin permiso.** Nada de UI kits, icon packs ni helpers de color. Iconos = **SVG inline** (criterio ya usado en ThemeToggle y dashboard).
2. **Copy de UI en español y centralizada** en `src/constants/` (preparación i18n). No incrustes textos sueltos en JSX.
3. **CSS-modules scoped por componente.** Nada global salvo tokens, reset y utilidades (`.sr-only`). Ver `references/scss-conventions.md`.
4. **No tocar código fuera del scope pedido.** Si un cambio visual tienta a refactorizar lógica, pregunta antes.
5. **No testear nombres de clase de CSS-modules** (el hash los transforma). Testea comportamiento o substring. Ver `references/scss-conventions.md`.
6. **Responsive obligatorio** en los 3 breakpoints (móvil/tablet/desktop). Mobile-first.
7. **Props con `interface`**, no `type`, salvo que no encaje. Sin `any` ni `@ts-ignore` sin comentario.

## Patrón de trabajo al estilar un componente

1. Lee `references/tokens.md` para saber qué tokens existen.
2. Estructura el markup semánticamente (ver `references/accessibility.md`): landmarks, `fieldset/legend` en formularios agrupados, foco visible.
3. Estila en el `.module.scss` del componente usando **solo** tokens. Si falta un token, añádelo a `_tokens.scss` (a todos los temas) en vez de hardcodear.
4. Verifica que se lee bien en **claro y oscuro** y que el contraste cumple lo básico (ver `references/accessibility.md`).
5. No añadas estilos globales. No testees clases.

## Jerarquía de superficies (clave de este sistema)

El problema histórico del proyecto era la **planitud**: `bg`, `surface` y `border` demasiado próximos en luminancia, sin nivel de elevación, y sombras que no se ven en oscuro. Al estilar contenedores (cards, inputs, paneles, modales) usa la escala de elevación documentada en `references/tokens.md` y, en modo oscuro, **apóyate en borde + diferencia de superficie**, no solo en `box-shadow` (que casi no se percibe sobre fondos oscuros).

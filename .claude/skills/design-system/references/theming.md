# Theming: patrón de temas y Recharts

## El patrón `[data-theme][data-mode]`

Los temas se seleccionan con **dos atributos independientes** en un ancestro (gestionados por `ThemeContext`): `data-theme` (qué paleta) y `data-mode` (`light`/`dark`). Cada tema declara sus 10 tokens cromáticos dos veces:

```scss
[data-theme='nombre'][data-mode='light'] { /* 10 tokens */ }
[data-theme='nombre'][data-mode='dark']  { /* 10 tokens */ }
```

`default·light` es además el bloque `:root`, que sirve de fallback si faltara un atributo.

**Por qué importa:** los componentes nunca conocen el tema. Solo consumen `var(--color-*)`. Por eso añadir un tema **no toca ningún componente**: basta con declarar sus bloques en `_tokens.scss` y registrarlo en `ThemeContext`.

## Añadir un tema nuevo (checklist)

1. **Decide la identidad cromática** y que no solape con los hue existentes (azul `default`, cian `ocean`, naranja `sunset`, verde `forest`).
2. En `_tokens.scss`, añade los dos bloques (`light` y `dark`) con **los 10 tokens cromáticos + los estructurales por tema** (`--color-surface-elevated`, `--focus-ring`, hover…). No omitas ninguno: un token faltante hereda el de `:root` y desentona.
3. Para cada modo, comprueba contraste básico (ver `references/accessibility.md`): `text` sobre `bg` y sobre `surface`, y `primary-contrast` sobre `primary`.
4. Registra el tema en la lista de temas de `ThemeContext` / constantes, para que aparezca en el selector y en `/showcase`.
5. Añade su botón de combo a `ShowcasePage` (claro y oscuro).
6. Verifica los **dos modos** en `/showcase` antes de dar por hecho el tema.

**Temas "ricos en color":** un tema puede usar más de un hue (p. ej. primary violeta + acentos magenta), pero **respeta el contrato de 10 tokens**. La riqueza va en la elección de valores, no en inventar tokens nuevos por tema (salvo los estructurales comunes a todos).

## Puente a Recharts

Recharts **no lee CSS variables** directamente en sus props de color. Para que los gráficos sigan el tema activo hay que resolver el token a su valor computado en JS:

```ts
const css = getComputedStyle(document.documentElement);
const primary = css.getPropertyValue('--color-primary').trim();
```

Pásalo luego a `fill`, `stroke`, etc. Para tooltips, usa objetos inline con los valores resueltos (`contentStyle`, `itemStyle`, `labelStyle`, `cursor`) — es el puente ya usado en `GenreDistributionChart`/`RatingDistributionChart`/`GenrePieChart`. Si el usuario cambia de tema en caliente, recalcula (los gráficos del dashboard ya consumen colores del tema activo).

**No** intentes pasar `var(--color-…)` como string a una prop de color de Recharts: no se resuelve y el gráfico sale sin color.

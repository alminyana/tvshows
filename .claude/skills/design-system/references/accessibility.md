# Accesibilidad

> Reconstruida a partir de las convenciones observadas en el proyecto (H7/H9/H10) y de `CONTEXT.md`/`PROFILE.md`. Si existe `/docs/a11y-guidelines.md`, esa es la fuente de verdad y debe prevalecer sobre esta referencia — actualízala con su contenido.

## Foco visible

- Todo interactivo debe tener foco visible vía `:focus-visible` (no `:focus`, para no mostrar anillo en clic de ratón).
- Usa el token `--focus-ring` (lo introduce el rediseño) para un anillo consistente; típicamente `outline` o `box-shadow` con el color del ring y `--radius-sm`.
- Navegación completa por teclado: tab/enter/escape. Modales con focus trap (al abrir, foco al primer focusable; tab/shift+tab ciclan dentro).

## `.sr-only`

Utilidad global (en `styles/global.scss`) con el patrón clip estándar para contenido solo-lectores. Úsala para labels de controles cuyo texto no debe verse (p. ej. radios del `Rating`). Si no estuviera definida, defínela una vez en global, no por componente.

## Contraste (objetivo del proyecto)

Cumplir lo **básico de WCAG AA**:
- Texto normal ≥ **4.5:1** contra su fondo.
- Texto grande (≥18.66px bold o ≥24px) y componentes UI/bordes ≥ **3:1**.
- Verifica `--color-text` sobre `--color-bg` **y** sobre `--color-surface`/`--color-surface-elevated`; y `--color-primary-contrast` sobre `--color-primary`. En **los dos modos** de cada tema.
- No persigas AAA a costa de la gama; AA es el suelo obligatorio.

## Patrones ARIA del proyecto

- **Formularios:** `FormField` envuelve label + control + error, y admite un `help` junto a la etiqueta. Para agrupar secciones usa `fieldset` + `legend` (legend = título de sección). El error se asocia al control; usa `aria-live` para feedback de acciones (el proyecto tiene `NotificationContext` con `role="status" aria-live="polite"`).
- **Ayuda contextual:** para un campo que hace algo no evidente, `HelpPopover` vía la prop `help` de `FormField`, y el control apuntando al panel con `aria-describedby`. Se abre **al pulsar, nunca al pasar el ratón**: un tooltip de hover es inalcanzable en táctil, que es justo donde peor se entienden esos campos. Cierra con Escape, con su × y con clic fuera, devolviendo el foco al disparador.
- **Iconos decorativos:** SVG con `aria-hidden="true"`; el texto accesible vive en el botón (`aria-label`/`title` dinámicos, como en `ThemeToggle`).
- **Botones con label ambiguo:** si dos botones comparten texto visible ("Añadir"), diferéncialos con `aria-label` distinto (`"Añadir género"` vs `"Añadir reparto"`) para no romper `getByRole`/`getByLabelText`.
- **Cuidado con el efecto contrario:** un `aria-label` que *contiene* el nombre del campo (`"Ayuda sobre Temporadas"`) hace que `getByLabelText(/temporadas/i)` encuentre dos elementos. Es correcto para un lector de pantalla, pero obliga a anclar la consulta en los tests (`/^temporadas$/i`).
- **Selects multi nativos:** el `<select multiple>` nativo no es estilable ni del todo accesible de forma consistente; está aceptado como limitación temporal del proyecto. Si se reemplaza algún día, hazlo con un patrón de checkboxes/chips accesible.

## Checklist al maquetar un interactivo

1. ¿Tiene foco visible (`:focus-visible` + `--focus-ring`)?
2. ¿Es operable por teclado (enter/space/escape donde aplique)?
3. ¿Tiene nombre accesible (label, `aria-label`, o texto)?
4. ¿Contraste AA en claro y oscuro?
5. ¿Llega a 44px de objetivo táctil en móvil? (En escritorio puede bajar; el proyecto sube a 44 bajo el breakpoint `tablet` y reduce por encima.)
5. ¿Iconos decorativos con `aria-hidden`?

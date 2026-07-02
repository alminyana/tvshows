# Plan de implementación — Rediseño visual

> Plan **enfocado solo en diseño y capa visual**. No cambia lógica de negocio, datos ni servicios.
> Estructurado por hitos de diseño (`D0`–`D6`), cada uno un PR autocontenido con su entregable y criterio de "hecho", al estilo de los planes `H#`/`F#` del proyecto.
>
> **Enfoque: tokens-first.** El problema de fondo no es "colores feos", es **falta de separación tonal entre capas (bg/surface/border)** y **escala tipográfica aplanada**, que vive en la capa semántica compartida `[data-theme][data-mode]`. Por eso el orden de ejecución **invierte** la numeración de los hitos de la consigna: primero la fundación de tokens+temas (consigna hito 3), luego primitives, luego vistas (hito 1), y al final el formulario de serie (hito 2). Arreglar la fundación mejora los 16 combos de una sola vez.
>
> **Modo de trabajo:** dirección visual se valida con un **mockup navegable** (D1) antes de tocar el repo; la implementación se pica con Claude Code referenciando este archivo, `CONTEXT.md`, `CLAUDE.md` y la **skill `design-system`** (prerrequisito D0).

---

## Diagnóstico (base del plan)

Observado en showcase, listado (cards+lista), detalle y formularios, en oscuro:

1. **No hay capa de elevación real.** `bg`, `surface` y `border` están demasiado cerca en luminancia. Cards, inputs y contenedores no se despegan del fondo. Las sombras `--shadow-*` no hacen trabajo perceptible en modo oscuro. **Problema transversal nº 1.**
2. **Escala tipográfica aplanada.** Headings de sección, meta, labels y rating pesan casi igual. Jerarquía pobre.
3. **Controles nativos sin estilar.** El `<select multiple>` de géneros usa el azul de selección del SO y rompe cualquier tema; el `<input type="file">` es nativo puro ("Seleccionar archivo / Ningún archivo seleccionado") y desentona con la dropzone custom (que sí está bien resuelta).
4. **Formulario de serie sin agrupación.** Columna plana label+input sin secciones. Pide `fieldset`.
5. **Inputs sin presencia.** Borde apenas más claro que el fondo; un campo vacío no se lee como campo. El único que destaca es el de error (rojo).
6. **Detalle de serie infrautilizado.** Mucho vacío, metadatos sueltos sin contenedor.
7. **SeriesCard sin contenedor.** En vista cards, el bloque de texto inferior flota sobre el fondo; funciona solo porque la portada ancla.

**Bugs de datos detectados (fuera de scope visual, anotados):** chip de género duplicado en "La amiga estupenda"; campo `seasons` inconsistente en idioma/formato ("4 seasons" / "Miniserie - 9 episodios").

---

## Decisiones de proyecto (parametrización del plan)

Acordadas antes de empezar:

- **Temas:** set final de **8** (los **4 actuales** —`predeterminado`, `oceano`, `sunset`, `forest`— + **4 nuevos**), todos con modo claro/oscuro → **16 combos**. No se retira ninguno.
- **Los 4 temas actuales:** se mantienen **solo a nivel de color** (su paleta/identidad cromática). El resto de mejoras —**espaciado, tipografía, elevación, foco, sombras y restyle de elementos**— **sí se les aplican**, porque viven en la capa semántica compartida y en las primitives. Es decir: mismos colores, pero con la nueva estructura visual. No quedan idénticos a hoy salvo en hue.
- **Temas nuevos:** dirección estética libre, **más ricos en color y tonos** que los 4 actuales. Propuesta de partida (a fijar en D1, maximizando distinción cromática frente a los azules/cálidos/verdes ya existentes): paletas multi-tono tipo **Amatista** (violeta), **Carmesí** (rojo-magenta), **Cian/Turquesa** vibrante y **Crepúsculo** (degradado multicolor cálido→frío). Se afina en D1 para no solapar con `oceano`/`sunset`/`forest`.
- **Contraste:** objetivo **visual** cumpliendo estándares básicos de accesibilidad (≈AA, 4.5:1 texto normal / 3:1 texto grande y UI). Sin obsesión por AAA.
- **`<select multiple>` nativo de géneros:** **se deja como está** (no es prioridad). Se documenta como limitación visual conocida. *Sí* se estiliza el `<input type="file">` (envolver + disparar desde botón propio, sin librería).
- **Fieldsets/secciones:** **solo** en el formulario de serie. `UserForm` y `LoginForm` fuera de scope de agrupación (heredan igualmente los inputs restyled).
- **Validación previa:** **mockup navegable** (D1) antes de tocar SCSS.
- **Sin librerías nuevas** sin aprobación (regla del proyecto). Iconos SVG inline (criterio H9/H10).
- **CSS-modules + tokens:** sin estilos globales salvo tokens/reset/utilidades. No testear nombres de clase de CSS-modules.

---

## Orden y dependencias

`D0 Skill (prerrequisito) → D1 Mockup → D2 Tokens+Temas → D3 Primitives → D4 Vistas → D5 Form serie → D6 a11y+cierre`

D3 depende de D2 (consume los tokens nuevos). D4 y D5 dependen de D3 (consumen primitives restyled). D2→D6 son secuenciales en la práctica, aunque D4 y D5 tocan áreas distintas (vistas vs. un formulario) y podrían solaparse una vez D3 está hecho.

| Hito | Consigna | Depende de | Complejidad |
|---|---|---|---|
| D0 Skill design-system | — | — | S · ✅ |
| D1 Mockup de validación | — | D0 | M · ✅ |
| D2 Tokens + temas | Hito 3 | D1 | L · ✅ |
| D3 Primitives UI | Hito 1 (base) | D2 | L · ✅ |
| D4 Vistas | Hito 1 | D3 | L · ✅ |
| D5 Formulario de serie | Hito 2 | D3 | M · ✅ |
| D6 a11y + responsive + cierre | Hito 1/2/3 | D4, D5 | M |

---

## D0 — Prerrequisito: skill `design-system` · Complejidad: S

- **Objetivo:** codificar el design system del proyecto en una skill de Claude Code para que la implementación no reinvente el SCSS ni rompa convenciones en cada hito.
- **Entregable:** `.claude/skills/design-system/` con `SKILL.md` (trigger) + `references/` (inventario de tokens, convenciones SCSS, patrón de temas, guía a11y, prohibiciones del proyecto).
- **Estado:** ✅ Completada — skill generada e instalada en `.claude/skills/design-system/` (`SKILL.md` + `references/{tokens,theming,scss-conventions,accessibility}.md`).
- **Dependencias:** ninguna.
- **Pendiente menor (no bloquea):** la sección a11y de la skill está reconstruida de las convenciones del proyecto; si aparece `/docs/a11y-guidelines.md`, sustituir `references/accessibility.md` por su contenido. Además, `references/tokens.md` documenta tokens estructurales (`--color-surface-elevated`, `--focus-ring`, hover, `--shadow-lg`) que aún no existen en `_tokens.scss`: revisar esa sección cuando D2 los cree.

### Contenido
- Inventario de tokens semánticos (`--color-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--font-*`) y su significado.
- Patrón `[data-theme][data-mode]`: cómo añadir un tema sin tocar consumidores.
- Convenciones CSS-modules: nada global salvo tokens/reset/utilidades; no testear nombres de clase; mobile-first y breakpoints (2/3/4/5 cols).
- Puente `getComputedStyle` para pasar tokens a Recharts.
- a11y: contraste objetivo, `:focus-visible`, `.sr-only`, referencia a `/docs/a11y-guidelines.md`.
- Prohibiciones: no libs sin permiso, copy en `constants`, no tocar markup fuera de scope.

### Hecho cuando
- La skill está commiteada en `.claude/skills/design-system/` y Claude Code la activa al maquetar.

---

## D1 — Mockup de validación visual (sin tocar el repo) · Complejidad: M

- **Objetivo:** fijar dirección visual y las 8 paletas × 2 modos **antes** de gastar ciclos en SCSS.
- **Entregable:** mockup navegable con la nueva escala de elevación y tipografía, los 4 temas actuales retocados (solo estructura) y los 4 nuevos, todos light/dark, y las primitives/clave renderizadas (Button familia, Input/Textarea/Select, Card, SeriesCard, SeriesRow, `fieldset` de form, KPI card, paleta categórica + gráficos).
- **Estado:** ✅ Completada — dirección aprobada. **Contrato visual congelado en `docs/design/mockup-D1.html`** (snapshot fechado de la decisión; la fuente de verdad pasa a ser `_tokens.scss` al implementar D2). Referenciable con `@docs/design/mockup-D1.html` desde Claude Code.
- **Dependencias:** D0.

### Decisiones cromáticas validadas en el mockup (entran en D2)

- **Token nuevo `--color-accent`** (+ `--color-accent-contrast`) en el contrato: en los 4 actuales **cae a `primary`** (siguen mono-hue); en los 4 nuevos diverge (multi-hue).
- **Token nuevo `--color-tertiary`** (+ contrast): 3er color de los temas nuevos; en los actuales cae a `primary` por fallback.
- **Paleta categórica derivada** de los tokens del propio tema (`primary · accent · tertiary · success · warning`), usada **solo en datos/decorativo** (chips de género, gráficos, degradado de portada). Los controles (botones/inputs/foco) se quedan en `primary`.
- **Temas nuevos** (multi-hue): **Amatista** (violeta + acento magenta + terciario cian), **Carmesí** (rojo-magenta + ámbar + violeta), **Cian-Turquesa** (teal + violeta + rosa), **Crepúsculo** (índigo + naranja + teal). 2 sobrios (Amatista, Crepúsculo) + 2 vibrantes (Carmesí, Cian).
- **Modo claro:** los 4 nuevos llevan **tinte medio** en `bg`/`surface` (identidad cromática en claro, manteniendo elevación); los 4 actuales quedan **neutros**.
- **Inversión de superficies en claro:** `bg` tintado/gris claro + `surface` más clara + sombra (antes `surface` era más oscura que `bg`). Da elevación real.
- **Sombras reforzadas** + `--shadow-lg` nuevo; en oscuro la elevación se apoya en borde + tono.

### Hecho cuando
- Apruebas la dirección y las 16 combinaciones de tema. Lo aprobado aquí es el contrato visual de D2–D5. ✅

---

## D2 — Fundación: tokens semánticos + temas · Complejidad: L · (Consigna hito 3)

- **Objetivo:** capa de tokens con elevación real, escala tipográfica con jerarquía, sombras que funcionen en dark, y los 8 temas (16 combos).
- **Entregable:** `_tokens.scss` reestructurado + 4 temas nuevos + los 4 actuales retocados; `/showcase` muestra los 16 combos correctos.
- **Estado:** ✅ Completada — `_tokens.scss` reestructurado con los 16 bloques (8 temas × 2 modos), tokens nuevos (`--color-surface-elevated`, `--color-accent`, `--color-tertiary`, sus contrasts, `--focus-ring`, `--shadow-lg`), 4 temas nuevos multi-hue registrados en `ThemeContext`/`VALID_THEMES`/`messages.ts`/`Header`. `/showcase` muestra 16 combos. Suite en verde.
- **Dependencias:** D1.

### Tareas
1. **Capa de elevación:** introducir nivel intermedio (`--color-surface` < `--color-surface-elevated`) con borde visible en oscuro; revisar `bg/surface/border` para separación tonal real. Sombras `--shadow-*` reforzadas con borde+tono (no solo `box-shadow`, que casi no se ve en dark). Añadir `--shadow-lg`.
2. **Tokens cromáticos nuevos en el contrato** (validados en D1): `--color-accent` (+ `--color-accent-contrast`) y `--color-tertiary` (+ `--color-tertiary-contrast`) en los **8 temas × 2 modos**. En los 4 actuales, `accent` y `tertiary` = `primary` (mono-hue). En los 4 nuevos, divergen (multi-hue). Ver valores exactos en `docs/design/mockup-D1.html`.
3. **Paleta categórica:** se **deriva** de los tokens del tema (`primary · accent · tertiary · success · warning`), no se mantienen colores sueltos. Se consume **solo en datos/decorativo** (chips de género, gráficos del dashboard, degradado de portada). Los controles (botones/inputs/foco) usan `primary`.
4. **Modo claro:** tinte medio en `bg`/`surface` de los 4 nuevos (identidad cromática conservando elevación); los 4 actuales quedan neutros. Inversión de superficies (`bg` claro tintado/gris + `surface` más clara + sombra).
5. **Escala tipográfica:** revisar `--font-size-*`/pesos para jerarquía clara (heading sección > label > body > meta).
6. **Foco:** `--focus-ring` consistente para `:focus-visible` en todos los interactivos.
7. **Los 4 temas actuales** (`predeterminado`, `oceano`, `sunset`, `forest`): conservar hue, aplicar la nueva estructura; `accent`/`tertiary` = `primary`.
8. Añadir **4 temas nuevos** (los fijados en D1), multi-hue, cada uno con bloque `[data-theme][data-mode]` claro+oscuro.
9. Verificar contraste (≈AA) en los 16 combos.

### Archivos
- `src/styles/themes/_tokens.scss` (o el índice de temas).
- `src/styles/global.scss` (utilidades, si aplica).
- `src/context/ThemeContext.tsx` / constantes de temas (registrar los 4 nuevos).
- `src/pages/ShowcasePage/` (botones de los nuevos combos).

### Tests
- `ThemeContext`: persistencia y `prefers-color-scheme` siguen verdes. Test de que los 8 temas están registrados.

### Hecho cuando
- `/showcase` permite recorrer los 16 combos sin recarga, todos con elevación y jerarquía visibles y contraste suficiente.

---

## D3 — Primitives UI (restyle) · Complejidad: L · (Consigna hito 1, base)

- **Objetivo:** subir el nivel visual de todas las primitives consumiendo los tokens nuevos.
- **Entregable:** `components/ui/*` restyled; `/showcase` como prueba visual.
- **Estado:** ✅ Completada — `Button` con roles diferenciados (ghost visible, focus-ring consistente vía `box-shadow`), `Input`/`Textarea`/`Select` con presencia real (borde 1.5px, `--color-surface-elevated`, hover, foco `--focus-ring`), `Card` elevada (`--color-surface-elevated` + `--shadow-md`/`--shadow-lg` en hover), `Rating` con estrellas vacías legibles (`--color-text-muted`), `Tag`/`IconButton` alineados al foco consistente. Nuevo primitive `components/ui/FileInput/` (input nativo oculto + `Button` secundario que dispara el click) integrado en `SeriesForm`, sin librería nueva. `FormField`/`Spinner`/`Avatar` ya cumplían tokens-first, sin cambios. Lint, `tsc -b` y suite (321 tests) en verde.
- **Dependencias:** D2.

### Tareas
1. **Button:** separar roles (primary/secondary/ghost/danger) con jerarquía clara; ghost deja de ser invisible. ✅
2. **Input / Textarea:** presencia real (borde, relleno, `:focus-visible`, estados error/disabled). Un campo vacío debe leerse como campo. ✅
3. **Select** (el estilable): coherente con Input. *(El `<select multiple>` nativo queda como está — decisión.)* ✅
4. **Tag / Chip:** ya están bien; alinear a tokens nuevos. ✅
5. **Card:** surface elevada real (borde+tono+sombra dark). ✅
6. **Rating:** estrellas vacías visibles (hoy casi negras sobre fondo oscuro). ✅
7. **`<input type="file">`:** envolver y disparar desde botón estilado (`Button`), ocultando el nativo. Sin librería. ✅ — nuevo `components/ui/FileInput/`.
8. **FormField, IconButton, Spinner, Avatar:** alinear a tokens. ✅

### Archivos
- `src/components/ui/{Button,Input,Textarea,Select,Tag,Card,Rating,FormField,IconButton}/`.

### Tests
- Tests existentes de primitives en verde (comportamiento/presencia, no clases).

### Hecho cuando
- En `/showcase` cada primitive se lee con jerarquía y elevación correctas en los 16 combos.

---

## D4 — Vistas · Complejidad: L · (Consigna hito 1)

- **Objetivo:** aplicar el sistema a las vistas con datos reales.
- **Entregable:** listado (cards+lista), detalle, dashboard, landing y header pulidos.
- **Estado:** ✅ Completada — `SeriesCard`/`SeriesRow` con elevación real (`shadow-md`→`shadow-lg` en card, `shadow-sm`+borde tintado en row), foco vía `--focus-ring`, degradado `primary→accent→tertiary` en placeholders sin portada, y géneros deduplicados (`Array.from(new Set(...))`, corrige el bug de chips repetidos). Chips de género ahora usan el primitive `Tag` con color categórico rotado (`primary·accent·tertiary·success·warning`, nuevo `src/utils/categoricalPalette.ts`), sustituyendo los `<span>` bespoke — consistente en Card, Row y `SeriesDetailPage`. `SeriesDetailPage` con `.metaCard` (surface+borde) agrupando año/temporadas/rating/género y jerarquía `title` (3xl bold) → meta → sinopsis reforzada. `DashboardPage`/`ShowcasePage`: `KPICard.accent` pasa de hex hardcodeado a `var(--color-primary/accent/tertiary/success)` (los gráficos ya usaban `Card`, heredan la elevación de D3 sin tocarlos). `Header`: foco consistente y `themeSelect`/`loginButton` alineados a los tokens de presencia de D3. `LandingPage` revisado, sin cambios (overlay intencionalmente fuera del sistema de temas). Corrección de D3: `Card` base volvía a `--color-surface` (no `-elevated`), fiel al contrato congelado en `mockup-D1.html`. Lint, `tsc -b` y suite (321 tests) en verde.
- **Dependencias:** D3.

### Tareas
1. **SeriesCard:** contenedor con elevación; jerarquía del bloque inferior (título > meta > género > rating); alturas uniformes (ya documentado en H9). Dedupe de chip de género (**bug** de "La amiga estupenda"). ✅
2. **SeriesRow (lista):** ritmo horizontal y agrupación; reducir el vacío entre columnas; consistencia visual del campo temporadas. ✅
3. **SeriesDetailPage:** contenedor para los metadatos (año/temporadas/rating/género); aprovechar el vacío inferior; jerarquía título→meta→sinopsis. ✅
4. **DashboardPage:** contenedores de KPI y de gráficos coherentes (los tooltips de Recharts ya están tematizados desde H9/H10); encabezados con icono ya existen. ✅
5. **LandingPage:** revisión ligera (ya está decente; ajustar a tokens nuevos si cambia algún color). ✅ — sin cambios de color.
6. **Header:** pulido de jerarquía y estados. ✅

### Archivos
- `src/components/features/{SeriesCard,SeriesRow}/`, `src/pages/{SeriesListPage,SeriesDetailPage,DashboardPage,LandingPage}/`, `src/components/layout/Header/`.
- `src/components/features/dashboard/*` (solo contenedor/encabezado, no la lógica de gráficos).

### Tests
- Tests existentes de estas vistas en verde; ajustar selectores solo si cambia el markup.

### Hecho cuando
- Listado, detalle y dashboard se leen con jerarquía y contención claras en los 16 combos, sin regресiones de comportamiento.

---

## D5 — Formulario de serie (agrupación + destacar inputs) · Complejidad: M · (Consigna hito 2)

- **Objetivo:** convertir la columna plana en un formulario con secciones y controles destacados.
- **Entregable:** `SeriesForm` con `fieldset`/`legend` por sección y campos con presencia.
- **Estado:** ✅ Completada — `SeriesForm` reestructurado en 5 `fieldset`/`legend` (contenedor `surface` + borde + radius-lg, legend uppercase en `--color-primary`, siguiendo `.fset`/`.fset > legend` de `mockup-D1.html`): **Portada**, **Datos básicos** (título+año en fila de 2 columnas + sinopsis), **Clasificación** (temporadas, géneros, **reparto** — decisión: reparto agrupa con clasificación en vez de con opinión), **Valoración**, **Opinión**. Legends centralizadas en `MESSAGES.series.sections`. Sin cambios en RHF/Zod ni en los `name`. `pasteZone`/`imagePlaceholder` subidos a `--color-surface-elevated` para no fundirse con el nuevo fondo `surface` del fieldset. Lint, `tsc -b` y suite (321 tests, sin tocar selectores) en verde.
- **Dependencias:** D3.

### Tareas
1. **Agrupación con `fieldset`/`legend`:** secciones temáticas — **Portada**, **Datos básicos** (título/año/sinopsis), **Clasificación** (temporadas/géneros/reparto), **Valoración** (rating), **Opinión**. Requiere tocar el **JSX** del form (acotado a estructura + estilo, sin cambiar la lógica RHF/Zod ni los `name`). ✅
2. **Inputs destacados:** heredan D3; revisar espaciado entre secciones y dentro de cada fieldset. ✅
3. **Controles concretos:** botones "Añadir" (género/reparto) con jerarquía; rating visible; `<input type="file">` estilado (de D3). El `<select multiple>` se deja como está. ✅ (ya resuelto en D3)
4. **Mantener** la dropzone de paste tal cual (referencia de calidad) y los `aria-label` distintos de los botones "Añadir" (cuidado con los selectores de test de H10). ✅

### Archivos
- `src/components/features/SeriesForm/SeriesForm.tsx` (+ `.module.scss`).
- `src/constants/messages.ts` (legends de sección, si se centraliza copy).

### Tests
- `SeriesForm` en verde. Los `fieldset`/`legend` no deben romper los `getByLabelText`/`getByRole` existentes; ajustar si algún selector depende de la estructura previa.

### Hecho cuando
- El formulario se lee por secciones, los campos destacan, y crear/editar sigue funcionando igual (sin cambios de lógica ni validación).

---

## D6 — Barrido a11y + responsive + cierre · Complejidad: M

- **Objetivo:** app lista, sin regресiones, en los 16 combos y 3 breakpoints.
- **Entregable:** suite verde, lint/tsc/build limpios, a11y y responsive verificados.
- **Estado:** ⬜ Pendiente.
- **Dependencias:** D4, D5.

### Tareas
1. `:focus-visible` correcto en todos los interactivos restyled.
2. Contraste verificado en los 16 combos (texto, UI, estados).
3. Responsive en móvil/tablet/desktop (incluye el nuevo grid de cards y el form por secciones).
4. `lint`, `tsc -b`, `build`, `test:run` limpios.
5. Confirmar `/showcase` sigue solo en DEV.

### Hecho cuando
- Los 16 combos pasan revisión visual y de contraste, el responsive aguanta en los 3 breakpoints, y toda la cadena de calidad está en verde.

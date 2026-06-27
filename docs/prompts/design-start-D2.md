Vamos a implementar el hito D2 del rediseño visual.

Contexto (léelo antes de tocar nada):
@docs/IMPLEMENTATION-PLAN-Design.md  → hito D2, tareas 1-9
@docs/design/mockup-D1.html          → contrato visual aprobado; los valores de tokens salen de aquí
@CONTEXT.md @PROFILE.md @CLAUDE.md
Y activa la skill design-system (lee sus references/ tokens y theming antes de editar SCSS).

ALCANCE: SOLO la capa de tokens y temas. NO toques todavía primitives, vistas ni el form
(eso es D3-D5). En D2 no se restylan componentes; solo se reestructura el sistema de tokens
y se registran los temas.

Tareas:
1. Reestructura src/styles/themes/_tokens.scss conservando el patrón [data-theme][data-mode]
   actual (no rehagas la arquitectura, solo amplía el contrato de tokens).
2. Añade la capa de elevación: token --color-surface-elevated en los 8 temas × 2 modos.
   En modo oscuro la elevación se apoya en borde + tono, no solo en box-shadow.
3. Añade los tokens nuevos del contrato en los 8 temas × 2 modos:
   --color-accent (+ --color-accent-contrast) y --color-tertiary (+ --color-tertiary-contrast).
   - En los 4 temas ACTUALES (default, ocean, sunset, forest): accent = tertiary = primary.
   - En los 4 NUEVOS: divergen (multi-hue).
4. Refuerza las sombras --shadow-* y añade --shadow-lg.
5. Añade --focus-ring por tema (para el :focus-visible que se consumirá en D3).
6. Modo claro: tinte medio en bg/surface de los 4 nuevos; los 4 actuales quedan neutros
   (con la inversión de superficies: bg claro + surface más clara + sombra).
7. Registra los 4 temas nuevos (amatista, carmesi, cian, crepusculo) en ThemeContext / la
   constante de temas y añade sus botones de combo (claro+oscuro) en ShowcasePage.
8. Verifica contraste ≈AA del texto sobre bg y surface, y de primary-contrast sobre primary,
   en los 16 combos.

Fuente de los valores: transcribe los hex EXACTOS desde el :root y los bloques
[data-theme][data-mode] del mockup-D1.html. Si algún nombre de token del mockup no coincide
con el de _tokens.scss real, adapta al nombre real del proyecto (el SCSS manda) y dímelo.

Reglas: tokens-first, sin librerías nuevas, CSS-modules/global según convenciones del proyecto,
no testees nombres de clase. La paleta categórica (chips/gráficos) solo se DEFINE como derivación
de tokens aquí; su consumo real es D3/D4.

Tests: que los tests de ThemeContext (persistencia + prefers-color-scheme) sigan en verde y
añade uno que verifique que los 8 temas están registrados.

Hecho cuando: /showcase recorre los 16 combos sin recarga, todos con elevación, jerarquía y
contraste visibles, y lint + tsc -b + test:run + build pasan limpios.

Trabaja en una rama feature. Antes de empezar a picar, dime si ves algún blocker o decisión
que deba resolver, en lugar de asumir. No hagas commit sin pasar lint y Vitest.

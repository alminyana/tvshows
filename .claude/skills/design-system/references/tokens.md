# Inventario de tokens

> **Fuente de verdad:** `src/styles/themes/_tokens.scss`. Esta referencia lo refleja. Si divergen, manda el SCSS — actualiza esta referencia tras cambios estructurales en los tokens.

## Índice
1. Tokens no cromáticos (compartidos por todos los temas)
2. Tokens cromáticos (uno por tema × modo)
3. Tokens estructurales que introduce el rediseño
4. Reglas de uso

---

## 1. Tokens no cromáticos (en `:root`, compartidos)

Viven en `:root` y son **idénticos en los 8 temas**. Mejorarlos afecta a todos los temas a la vez.

```
// Sombras
--shadow-sm: 0 1px 2px rgba(0,0,0,.06);
--shadow-md: 0 4px 6px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.05);

// Radios
--radius-sm: 4px;  --radius-md: 8px;  --radius-lg: 16px;

// Espaciado (escala 4px)
--space-1: 4px;  --space-2: 8px;  --space-3: 12px;  --space-4: 16px;
--space-5: 24px; --space-6: 32px; --space-7: 48px;  --space-8: 64px;

// Tipografía
--font-sans: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

--font-size-xs: .75rem;   --font-size-sm: .875rem;  --font-size-md: 1rem;
--font-size-lg: 1.125rem; --font-size-xl: 1.25rem;  --font-size-2xl: 1.5rem;
--font-size-3xl: 1.875rem;

--font-weight-normal: 400; --font-weight-medium: 500;
--font-weight-semibold: 600; --font-weight-bold: 700;

--line-height-tight: 1.25; --line-height-normal: 1.5; --line-height-relaxed: 1.75;
```

**Notas:**
- No existe `--shadow-lg` (el rediseño lo añade; ver §3).
- El espaciado sigue una escala de 4px. No uses px sueltos: elige el `--space-*` más cercano.

---

## 2. Tokens cromáticos (por tema × modo)

Cada tema declara estos **10 tokens** en dos bloques: `[data-theme='X'][data-mode='light']` y `[data-theme='X'][data-mode='dark']`. `default·light` es además el bloque `:root` de fallback.

```
--color-bg                 // fondo de página
--color-surface            // superficie de tarjetas/paneles sobre bg
--color-text               // texto principal
--color-text-muted         // texto secundario / meta
--color-primary            // color de marca / acción primaria
--color-primary-contrast   // texto sobre fondo primary
--color-border             // bordes y separadores
--color-danger             // error / destructivo
--color-success            // éxito
--color-warning            // aviso
```

### Paletas actuales (referencia de hue — NO cambiar el color de estos 4)

| Tema | Identidad | primary light / dark |
|---|---|---|
| `default` | Azul neutro | `#2563eb` / `#60a5fa` |
| `ocean` | Azul-cian | `#0284c7` / `#38bdf8` |
| `sunset` | Naranja cálido | `#ea580c` / `#fb923c` |
| `forest` | Verde | `#16a34a` / `#4ade80` |

Los 4 actuales conservan su **color**; reciben el resto de mejoras estructurales (§3) porque viven en la capa compartida o en las primitives.

### Temas nuevos

Cada tema nuevo añade los mismos 10 tokens × 2 modos. Deben ser **más ricos en color** y no solapar el hue de los 4 actuales. Al crearlos, sigue `references/theming.md`.

---

## 3. Tokens estructurales que introduce el rediseño

El sistema actual es plano: no hay nivel de elevación, el foco no está tokenizado y las sombras no se ven en oscuro. El rediseño (hito D2/D3) añade estos tokens. **Úsalos en componentes nuevos; al implementarlos, decláralos en `_tokens.scss` para los 8 temas.**

```
// Elevación: nivel intermedio entre surface y bg, para cards/inputs/paneles
--color-surface-elevated   // por tema, armonizado con su hue (más claro que surface en light, más claro que surface en dark)

// Foco
--focus-ring               // color del anillo de :focus-visible (suele = primary con alpha)

// Estados de interacción (opcionales pero recomendados)
--color-surface-hover      // hover sobre superficies
--color-primary-hover      // hover del primary

// Sombra grande (no existía)
--shadow-lg: 0 10px 15px rgba(0,0,0,.1), 0 4px 6px rgba(0,0,0,.05);
```

**Importante para modo oscuro:** las sombras `rgba(0,0,0,…)` apenas se perciben sobre fondos oscuros. Para dar elevación en dark, **combina `--color-surface-elevated` + `--color-border`** (un borde sutil más claro) en lugar de confiar en `box-shadow`. En claro, la sombra sí trabaja.

---

## 4. Reglas de uso

- **Texto sobre primary** → siempre `--color-primary-contrast`, nunca blanco/negro hardcodeado.
- **Jerarquía de texto** → `--color-text` para principal, `--color-text-muted` para meta/secundario. No inventes grises.
- **Contenedores** → `--color-surface` o `--color-surface-elevated` (nunca un gris suelto), con `--color-border`.
- **No uses `--color-success/danger/warning` como decoración**; resérvalos para su significado semántico.
- Si un diseño pide un tono que no existe, **no lo hardcodees**: evalúa si falta un token y añádelo a todos los temas.

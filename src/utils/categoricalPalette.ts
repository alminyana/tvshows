// Paleta categórica derivada de los tokens del tema activo (decisión D1/D2),
// usada solo en datos/decorativo: chips de género, gráficos, degradado de portada.
// Cada slot resuelve a `--cat-N` en `_tokens.scss`, una rotación de matiz del
// `primary` del tema; así los 5 se distinguen en los 8 temas y en los 2 modos.
export const CATEGORICAL_SLOTS = [1, 2, 3, 4, 5] as const;

export type CategoricalColor = (typeof CATEGORICAL_SLOTS)[number];

export function categoricalColor(index: number): CategoricalColor {
  return CATEGORICAL_SLOTS[index % CATEGORICAL_SLOTS.length];
}

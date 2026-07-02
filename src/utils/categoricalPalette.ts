// Paleta categórica derivada de los tokens del tema activo (decisión D1/D2),
// usada solo en datos/decorativo: chips de género, gráficos, degradado de portada.
export const CATEGORICAL_COLORS = ['primary', 'accent', 'tertiary', 'success', 'warning'] as const;

export type CategoricalColor = (typeof CATEGORICAL_COLORS)[number];

export function categoricalColor(index: number): CategoricalColor {
  return CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length];
}

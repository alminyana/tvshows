export type SeasonsType = 'miniserie' | 'single' | 'multi';

/**
 * Clasifica el campo de texto libre `seasons` en uno de tres tipos de duración.
 * El número se asocia explícitamente a la palabra "season"/"temporada" para no
 * confundirlo con el recuento de episodios (ej. "Primera temporada - 8 episodios").
 */
export function classifySeasons(seasons: string): SeasonsType {
  const text = seasons.toLowerCase();
  if (text.includes('miniserie')) return 'miniserie';
  const match = text.match(/(\d+)\s*ª?\s*(?:season|temporada)/);
  if (match) return Number(match[1]) > 1 ? 'multi' : 'single';
  return 'single';
}

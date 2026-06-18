/**
 * Convierte el valor `seasons` legacy (numérico, pre-H9) al texto libre actual.
 * Los registros ya persistidos como string se devuelven sin tocar.
 */
export function migrateSeasons(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value === 1 ? '1 temporada' : `${value} temporadas`;
  }
  return typeof value === 'string' ? value : '';
}

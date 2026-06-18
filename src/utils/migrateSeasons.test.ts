import { describe, expect, it } from 'vitest';
import { migrateSeasons } from './migrateSeasons';

describe('migrateSeasons', () => {
  it('convierte 1 al singular', () => {
    expect(migrateSeasons(1)).toBe('1 temporada');
  });

  it('convierte >1 al plural', () => {
    expect(migrateSeasons(5)).toBe('5 temporadas');
  });

  it('deja intactos los valores ya en string', () => {
    expect(migrateSeasons('Miniserie de 6 episodios')).toBe(
      'Miniserie de 6 episodios',
    );
    expect(migrateSeasons('')).toBe('');
  });

  it('descarta números no finitos y tipos inesperados', () => {
    expect(migrateSeasons(NaN)).toBe('');
    expect(migrateSeasons(null)).toBe('');
    expect(migrateSeasons(undefined)).toBe('');
    expect(migrateSeasons({ seasons: 3 })).toBe('');
  });
});

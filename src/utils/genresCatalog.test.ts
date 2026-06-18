import { describe, it, expect, beforeEach } from 'vitest';
import { getAllGenres, getCustomGenres, addCustomGenre } from './genresCatalog';
import { GENRES } from '@/types/genre';

describe('genresCatalog', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('getAllGenres devuelve los predefinidos cuando no hay personalizados', () => {
    expect(getAllGenres()).toEqual(GENRES);
  });

  it('addCustomGenre añade un género nuevo y persiste', () => {
    const canonical = addCustomGenre('Western');
    expect(canonical).toBe('Western');
    expect(getCustomGenres()).toContain('Western');
    expect(getAllGenres()).toContain('Western');
  });

  it('normaliza con trim', () => {
    addCustomGenre('  Musical  ');
    expect(getCustomGenres()).toContain('Musical');
  });

  it('no duplica un género existente (case-insensitive) y devuelve el canónico', () => {
    expect(addCustomGenre('drama')).toBe('Drama');
    expect(getCustomGenres()).not.toContain('drama');

    addCustomGenre('Western');
    expect(addCustomGenre('western')).toBe('Western');
    expect(getCustomGenres().filter((g) => g.toLowerCase() === 'western')).toHaveLength(1);
  });

  it('devuelve null para nombre vacío', () => {
    expect(addCustomGenre('   ')).toBeNull();
    expect(getCustomGenres()).toEqual([]);
  });
});

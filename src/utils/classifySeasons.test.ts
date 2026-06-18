import { describe, it, expect } from 'vitest';
import { classifySeasons } from './classifySeasons';

describe('classifySeasons', () => {
  it('detecta miniseries', () => {
    expect(classifySeasons('Miniserie - 6 episodios')).toBe('miniserie');
    expect(classifySeasons('Miniserie Documental de 5 episodios')).toBe('miniserie');
  });

  it('clasifica varias temporadas como multi', () => {
    expect(classifySeasons('2 seasons')).toBe('multi');
    expect(classifySeasons('10 seasons - 22 episodios')).toBe('multi');
    expect(classifySeasons('3 temporadas')).toBe('multi');
  });

  it('clasifica una sola temporada como single', () => {
    expect(classifySeasons('1 temporada - 8 episodios')).toBe('single');
    expect(classifySeasons('1ª season - 9 episodios')).toBe('single');
  });

  it('no confunde el número de episodios con el de temporadas', () => {
    expect(classifySeasons('Primera temporada - 8 episodios')).toBe('single');
  });

  it('cae a single cuando no hay info de temporadas', () => {
    expect(classifySeasons('Película')).toBe('single');
    expect(classifySeasons('26 episodios')).toBe('single');
    expect(classifySeasons('')).toBe('single');
  });
});

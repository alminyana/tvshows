import { describe, it, expect } from 'vitest';
import { seriesSchema } from './seriesSchema';

const validData = {
  title: 'Breaking Bad',
  synopsis: 'Un profesor de química.',
  seasons: '5 temporadas',
  year: 2008,
  rating: 5,
  genres: ['Drama', 'Thriller'],
  cast: ['Bryan Cranston'],
  opinion: 'Magistral.',
};

describe('seriesSchema', () => {
  it('valida datos correctos', () => {
    expect(seriesSchema.safeParse(validData).success).toBe(true);
  });

  it('valida datos mínimos (sin cast ni opinion)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { cast: _cast, opinion: _opinion, ...minimal } = validData;
    expect(seriesSchema.safeParse(minimal).success).toBe(true);
  });

  it('title requerido', () => {
    const result = seriesSchema.safeParse({ ...validData, title: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.title).toBeDefined();
    }
  });

  it('synopsis requerida', () => {
    const result = seriesSchema.safeParse({ ...validData, synopsis: '' });
    expect(result.success).toBe(false);
  });

  it('seasons requerido (texto no vacío)', () => {
    expect(seriesSchema.safeParse({ ...validData, seasons: '' }).success).toBe(false);
    expect(seriesSchema.safeParse({ ...validData, seasons: 'Una temporada' }).success).toBe(true);
  });

  it('year mínimo 1900', () => {
    expect(seriesSchema.safeParse({ ...validData, year: 1899 }).success).toBe(false);
    expect(seriesSchema.safeParse({ ...validData, year: 1900 }).success).toBe(true);
  });

  it('year máximo año actual', () => {
    const futureYear = new Date().getFullYear() + 1;
    expect(seriesSchema.safeParse({ ...validData, year: futureYear }).success).toBe(false);
  });

  it('rating entero entre 1 y 5', () => {
    expect(seriesSchema.safeParse({ ...validData, rating: 0 }).success).toBe(false);
    expect(seriesSchema.safeParse({ ...validData, rating: 6 }).success).toBe(false);
    expect(seriesSchema.safeParse({ ...validData, rating: 1.5 }).success).toBe(false);
    expect(seriesSchema.safeParse({ ...validData, rating: 1 }).success).toBe(true);
    expect(seriesSchema.safeParse({ ...validData, rating: 5 }).success).toBe(true);
  });

  it('genres requiere al menos uno', () => {
    expect(seriesSchema.safeParse({ ...validData, genres: [] }).success).toBe(false);
  });

  it('genres acepta géneros personalizados (texto libre no vacío)', () => {
    expect(seriesSchema.safeParse({ ...validData, genres: ['Western'] }).success).toBe(true);
  });

  it('genres rechaza strings vacíos', () => {
    expect(seriesSchema.safeParse({ ...validData, genres: [''] }).success).toBe(false);
  });

  it('cast puede ser array vacío si se omite', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { cast: _cast, ...rest } = validData;
    expect(seriesSchema.safeParse(rest).success).toBe(true);
  });

  it('cast rechaza strings vacíos en el array', () => {
    expect(seriesSchema.safeParse({ ...validData, cast: [''] }).success).toBe(false);
  });

  it('opinion opcional', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { opinion: _opinion, ...rest } = validData;
    expect(seriesSchema.safeParse(rest).success).toBe(true);
  });
});

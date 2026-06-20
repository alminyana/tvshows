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

  it('valida datos mínimos (solo title)', () => {
    expect(seriesSchema.safeParse({ title: 'Breaking Bad' }).success).toBe(true);
  });

  it('title requerido', () => {
    const result = seriesSchema.safeParse({ ...validData, title: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.title).toBeDefined();
    }
  });

  it('synopsis opcional (acepta vacío y ausente)', () => {
    expect(seriesSchema.safeParse({ ...validData, synopsis: '' }).success).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { synopsis: _s, ...rest } = validData;
    expect(seriesSchema.safeParse(rest).success).toBe(true);
  });

  it('seasons opcional (acepta vacío y ausente)', () => {
    expect(seriesSchema.safeParse({ ...validData, seasons: '' }).success).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { seasons: _s, ...rest } = validData;
    expect(seriesSchema.safeParse(rest).success).toBe(true);
  });

  it('year mínimo 1900 cuando se proporciona', () => {
    expect(seriesSchema.safeParse({ ...validData, year: 1899 }).success).toBe(false);
    expect(seriesSchema.safeParse({ ...validData, year: 1900 }).success).toBe(true);
  });

  it('year máximo año actual cuando se proporciona', () => {
    const futureYear = new Date().getFullYear() + 1;
    expect(seriesSchema.safeParse({ ...validData, year: futureYear }).success).toBe(false);
  });

  it('year opcional (acepta ausente o string vacío)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { year: _y, ...rest } = validData;
    expect(seriesSchema.safeParse(rest).success).toBe(true);
    expect(seriesSchema.safeParse({ ...validData, year: '' }).success).toBe(true);
  });

  it('rating entero entre 0 y 5 (0 = sin valorar)', () => {
    expect(seriesSchema.safeParse({ ...validData, rating: 0 }).success).toBe(true);
    expect(seriesSchema.safeParse({ ...validData, rating: 6 }).success).toBe(false);
    expect(seriesSchema.safeParse({ ...validData, rating: 1.5 }).success).toBe(false);
    expect(seriesSchema.safeParse({ ...validData, rating: 1 }).success).toBe(true);
    expect(seriesSchema.safeParse({ ...validData, rating: 5 }).success).toBe(true);
  });

  it('rating opcional (acepta ausente)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { rating: _r, ...rest } = validData;
    expect(seriesSchema.safeParse(rest).success).toBe(true);
  });

  it('genres opcional (acepta array vacío y ausente)', () => {
    expect(seriesSchema.safeParse({ ...validData, genres: [] }).success).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { genres: _g, ...rest } = validData;
    expect(seriesSchema.safeParse(rest).success).toBe(true);
  });

  it('genres acepta géneros personalizados (texto libre no vacío)', () => {
    expect(seriesSchema.safeParse({ ...validData, genres: ['Western'] }).success).toBe(true);
  });

  it('genres rechaza strings vacíos dentro del array', () => {
    expect(seriesSchema.safeParse({ ...validData, genres: [''] }).success).toBe(false);
  });

  it('cast puede omitirse o ser array vacío', () => {
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

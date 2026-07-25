import { describe, it, expect } from 'vitest';
import {
  mapDbRowToSeries,
  mapSeriesToDbInsert,
  mapSeriesToDbUpdate,
  type SeriesDbRow,
} from './seriesMapper';
import type { Series } from '@/types/series';

const dbRow: SeriesDbRow = {
  id: 'series-1',
  title: 'Breaking Bad',
  synopsis: 'Un químico que fabrica metanfetamina.',
  seasons: '5',
  year: 2008,
  rating: 5,
  opinion: 'Obra maestra',
  cover_image_path: 'covers/series-1.jpg',
  cast_members: ['Bryan Cranston', 'Aaron Paul'],
  created_by: 'user-1',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  series_genres: [{ genres: { name: 'Drama' } }, { genres: { name: 'Thriller' } }],
};

const seriesData: Omit<Series, 'id' | 'createdAt' | 'updatedAt'> = {
  title: 'Breaking Bad',
  synopsis: 'Un químico que fabrica metanfetamina.',
  seasons: '5',
  year: 2008,
  rating: 5,
  opinion: 'Obra maestra',
  coverImage: 'covers/series-1.jpg',
  cast: ['Bryan Cranston', 'Aaron Paul'],
  genres: ['Drama'],
  createdBy: 'user-1',
};

describe('mapDbRowToSeries', () => {
  it('mapea cast_members a cast', () => {
    expect(mapDbRowToSeries(dbRow).cast).toEqual(['Bryan Cranston', 'Aaron Paul']);
  });

  it('devuelve cast vacío si cast_members es null', () => {
    expect(mapDbRowToSeries({ ...dbRow, cast_members: null }).cast).toEqual([]);
  });

  it('aplana los géneros del join', () => {
    expect(mapDbRowToSeries(dbRow).genres).toEqual(['Drama', 'Thriller']);
  });
});

describe('mapSeriesToDbInsert', () => {
  it('incluye cast_members en el payload', () => {
    const insert = mapSeriesToDbInsert(seriesData, 'series-1', '2024-01-01T00:00:00.000Z');
    expect(insert.cast_members).toEqual(['Bryan Cranston', 'Aaron Paul']);
  });

  it('envía un array vacío si no hay reparto', () => {
    const insert = mapSeriesToDbInsert(
      { ...seriesData, cast: [] },
      'series-1',
      '2024-01-01T00:00:00.000Z'
    );
    expect(insert.cast_members).toEqual([]);
  });
});

describe('mapSeriesToDbUpdate', () => {
  const now = '2024-01-02T00:00:00.000Z';

  it('incluye cast_members cuando cast viene informado', () => {
    expect(mapSeriesToDbUpdate({ cast: ['Anna Gunn'] }, now).cast_members).toEqual(['Anna Gunn']);
  });

  it('permite vaciar el reparto', () => {
    expect(mapSeriesToDbUpdate({ cast: [] }, now).cast_members).toEqual([]);
  });

  it('omite cast_members si cast es undefined', () => {
    expect(mapSeriesToDbUpdate({ title: 'Otro' }, now)).not.toHaveProperty('cast_members');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Series } from '../types/series';

const mockSupabase = vi.hoisted(() => {
  const chain = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
  };
  // Encadenar todos los métodos sobre sí mismos para permitir fluent API
  Object.values(chain).forEach((fn) => {
    fn.mockReturnValue(chain);
  });
  return {
    from: vi.fn(() => chain),
    _chain: chain,
  };
});

vi.mock('@/lib/supabase', () => ({ supabase: mockSupabase }));

import { seriesServiceSupabase } from './seriesService.supabase';

const dbRow = {
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

const expectedSeries: Series = {
  id: 'series-1',
  title: 'Breaking Bad',
  synopsis: 'Un químico que fabrica metanfetamina.',
  seasons: '5',
  year: 2008,
  rating: 5,
  opinion: 'Obra maestra',
  coverImage: 'covers/series-1.jpg',
  createdBy: 'user-1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  genres: ['Drama', 'Thriller'],
  cast: ['Bryan Cranston', 'Aaron Paul'],
};

beforeEach(() => {
  vi.clearAllMocks();
  const chain = mockSupabase._chain;
  Object.values(chain).forEach((fn) => {
    (fn as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  });
  mockSupabase.from.mockReturnValue(chain);
});

describe('seriesServiceSupabase.getAll', () => {
  it('mapea las filas de BD a Series y las devuelve', async () => {
    mockSupabase._chain.order.mockResolvedValue({ data: [dbRow], error: null });
    const result = await seriesServiceSupabase.getAll();
    expect(result).toEqual([expectedSeries]);
    expect(mockSupabase.from).toHaveBeenCalledWith('series');
  });

  it('lanza error si Supabase devuelve error', async () => {
    mockSupabase._chain.order.mockResolvedValue({ data: null, error: { message: 'DB error' } });
    await expect(seriesServiceSupabase.getAll()).rejects.toMatchObject({ message: 'DB error' });
  });
});

describe('seriesServiceSupabase.getById', () => {
  it('devuelve la serie mapeada si existe', async () => {
    mockSupabase._chain.single.mockResolvedValue({ data: dbRow, error: null });
    const result = await seriesServiceSupabase.getById('series-1');
    expect(result).toEqual(expectedSeries);
  });

  it('devuelve undefined si Supabase devuelve PGRST116', async () => {
    mockSupabase._chain.single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'Not found' },
    });
    const result = await seriesServiceSupabase.getById('no-existe');
    expect(result).toBeUndefined();
  });

  it('lanza error si es un error distinto de PGRST116', async () => {
    mockSupabase._chain.single.mockResolvedValue({
      data: null,
      error: { code: '42P01', message: 'DB error' },
    });
    await expect(seriesServiceSupabase.getById('x')).rejects.toMatchObject({ code: '42P01' });
  });
});

describe('seriesServiceSupabase.remove', () => {
  it('llama a delete con el id correcto', async () => {
    mockSupabase._chain.eq.mockResolvedValue({ error: null });
    await seriesServiceSupabase.remove('series-1');
    expect(mockSupabase._chain.delete).toHaveBeenCalled();
    expect(mockSupabase._chain.eq).toHaveBeenCalledWith('id', 'series-1');
  });

  it('lanza error si Supabase falla', async () => {
    mockSupabase._chain.eq.mockResolvedValue({ error: { message: 'RLS violation' } });
    await expect(seriesServiceSupabase.remove('series-1')).rejects.toMatchObject({
      message: 'RLS violation',
    });
  });
});

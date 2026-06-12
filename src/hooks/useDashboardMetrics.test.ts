import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDashboardMetrics } from './useDashboardMetrics';
import type { Series } from '../types/series';

const mockUseSeries = vi.hoisted(() => vi.fn());

vi.mock('./useSeries', () => ({
  useSeries: mockUseSeries,
}));

const SERIES_MOCK: Series[] = [
  {
    id: '1', title: 'S1', coverImage: 'img1', synopsis: 'Syn1', seasons: '3 temporadas',
    cast: ['A'], year: 2020, rating: 5, genres: ['Drama', 'Thriller'],
    createdBy: 'u1', createdAt: '2020-01-01', updatedAt: '2020-01-01',
  },
  {
    id: '2', title: 'S2', coverImage: 'img2', synopsis: 'Syn2', seasons: '2 temporadas',
    cast: ['B'], year: 2021, rating: 4, genres: ['Drama'],
    createdBy: 'u1', createdAt: '2021-01-01', updatedAt: '2021-01-01',
  },
  {
    id: '3', title: 'S3', coverImage: 'img3', synopsis: 'Syn3', seasons: '1 temporadas',
    cast: ['C'], year: 2022, rating: 2, genres: ['Comedia'],
    createdBy: 'u2', createdAt: '2022-01-01', updatedAt: '2022-01-01',
  },
];

describe('useDashboardMetrics', () => {
  beforeEach(() => {
    mockUseSeries.mockReturnValue({
      series: SERIES_MOCK,
      loading: false,
      error: null,
      reload: vi.fn(),
    });
  });

  it('calcula totalSeries', () => {
    const { result } = renderHook(() => useDashboardMetrics());
    expect(result.current.totalSeries).toBe(3);
  });

  it('calcula featuredSeries (rating >= 4)', () => {
    const { result } = renderHook(() => useDashboardMetrics());
    expect(result.current.featuredSeries).toBe(2);
  });

  it('calcula genreDistribution con count correcto', () => {
    const { result } = renderHook(() => useDashboardMetrics());
    const drama = result.current.genreDistribution.find((g) => g.genre === 'Drama');
    const thriller = result.current.genreDistribution.find((g) => g.genre === 'Thriller');
    const comedia = result.current.genreDistribution.find((g) => g.genre === 'Comedia');
    expect(drama?.count).toBe(2);
    expect(thriller?.count).toBe(1);
    expect(comedia?.count).toBe(1);
  });

  it('ordena genreDistribution por count descendente', () => {
    const { result } = renderHook(() => useDashboardMetrics());
    const counts = result.current.genreDistribution.map((g) => g.count);
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i - 1]).toBeGreaterThanOrEqual(counts[i]);
    }
  });

  it('ratingDistribution contiene los 5 valores (1-5)', () => {
    const { result } = renderHook(() => useDashboardMetrics());
    const ratings = result.current.ratingDistribution.map((r) => r.rating);
    expect(ratings).toEqual([1, 2, 3, 4, 5]);
  });

  it('cuenta correctamente ratingDistribution', () => {
    const { result } = renderHook(() => useDashboardMetrics());
    const r5 = result.current.ratingDistribution.find((r) => r.rating === 5);
    const r4 = result.current.ratingDistribution.find((r) => r.rating === 4);
    const r2 = result.current.ratingDistribution.find((r) => r.rating === 2);
    const r1 = result.current.ratingDistribution.find((r) => r.rating === 1);
    expect(r5?.count).toBe(1);
    expect(r4?.count).toBe(1);
    expect(r2?.count).toBe(1);
    expect(r1?.count).toBe(0);
  });

  it('devuelve totalSeries 0 cuando no hay series', () => {
    mockUseSeries.mockReturnValue({ series: [], loading: false, error: null, reload: vi.fn() });
    const { result } = renderHook(() => useDashboardMetrics());
    expect(result.current.totalSeries).toBe(0);
    expect(result.current.featuredSeries).toBe(0);
    expect(result.current.genreDistribution).toEqual([]);
    expect(result.current.ratingDistribution.every((r) => r.count === 0)).toBe(true);
  });

  it('propaga loading y error de useSeries', () => {
    mockUseSeries.mockReturnValue({ series: [], loading: true, error: 'fallo', reload: vi.fn() });
    const { result } = renderHook(() => useDashboardMetrics());
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe('fallo');
  });
});

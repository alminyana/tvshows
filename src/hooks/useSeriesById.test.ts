import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSeriesById } from './useSeriesById';
import type { Series } from '../types/series';

const mockSeries: Series = {
  id: 'abc-1',
  title: 'Severance',
  synopsis: 'Sinopsis',
  seasons: '2 temporadas',
  cast: ['Adam Scott'],
  year: 2022,
  rating: 5,
  genres: ['Ciencia ficción'],
  coverImage: 'img-1',
  createdBy: 'user-1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

vi.mock('../services/seriesService', () => ({
  seriesService: {
    getById: vi.fn(),
  },
}));

import { seriesService } from '../services/seriesService';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useSeriesById', () => {
  it('devuelve la serie si existe', async () => {
    vi.mocked(seriesService.getById).mockResolvedValue(mockSeries);
    const { result } = renderHook(() => useSeriesById('abc-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.series).toEqual(mockSeries);
    expect(result.current.notFound).toBe(false);
  });

  it('marca notFound si el servicio devuelve undefined', async () => {
    vi.mocked(seriesService.getById).mockResolvedValue(undefined);
    const { result } = renderHook(() => useSeriesById('no-existe'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.notFound).toBe(true);
    expect(result.current.series).toBeNull();
  });

  it('expone error si el servicio falla', async () => {
    vi.mocked(seriesService.getById).mockRejectedValue(new Error('DB error'));
    const { result } = renderHook(() => useSeriesById('abc-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
  });
});

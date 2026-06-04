import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSeries } from './useSeries';
import type { Series } from '../types/series';

const mockSeries: Series[] = [
  {
    id: '1',
    title: 'Breaking Bad',
    synopsis: 'Sinopsis',
    seasons: 5,
    cast: ['Bryan Cranston'],
    year: 2008,
    rating: 5,
    genres: ['Drama'],
    coverImage: 'img-1',
    createdBy: 'user-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

vi.mock('../services/seriesService', () => ({
  seriesService: {
    getAll: vi.fn(),
  },
}));

import { seriesService } from '../services/seriesService';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useSeries', () => {
  it('devuelve las series tras la carga', async () => {
    vi.mocked(seriesService.getAll).mockResolvedValue(mockSeries);
    const { result } = renderHook(() => useSeries());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.series).toEqual(mockSeries);
    expect(result.current.error).toBeNull();
  });

  it('expone error si el servicio falla', async () => {
    vi.mocked(seriesService.getAll).mockRejectedValue(new Error('DB error'));
    const { result } = renderHook(() => useSeries());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
    expect(result.current.series).toEqual([]);
  });
});

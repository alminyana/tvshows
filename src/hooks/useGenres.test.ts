import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useGenres } from './useGenres';

vi.mock('@/services', () => ({
  genresService: {
    getAll: vi.fn(),
    add: vi.fn(),
  },
}));

import { genresService } from '@/services';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useGenres', () => {
  it('devuelve el catálogo tras la carga', async () => {
    vi.mocked(genresService.getAll).mockResolvedValue(['Drama', 'Comedia']);
    const { result } = renderHook(() => useGenres());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.genres).toEqual(['Drama', 'Comedia']);
    expect(result.current.error).toBeNull();
  });

  it('expone error si el servicio falla', async () => {
    vi.mocked(genresService.getAll).mockRejectedValue(new Error('DB error'));
    const { result } = renderHook(() => useGenres());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
    expect(result.current.genres).toEqual([]);
  });

  it('add persiste el género nuevo y lo añade al catálogo', async () => {
    vi.mocked(genresService.getAll).mockResolvedValue(['Drama']);
    vi.mocked(genresService.add).mockResolvedValue('Western');
    const { result } = renderHook(() => useGenres());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let returned: string | null = null;
    await act(async () => {
      returned = await result.current.add('Western');
    });

    expect(genresService.add).toHaveBeenCalledWith('Western');
    expect(returned).toBe('Western');
    expect(result.current.genres).toEqual(['Drama', 'Western']);
  });

  it('add no duplica un género existente (case-insensitive)', async () => {
    vi.mocked(genresService.getAll).mockResolvedValue(['Drama']);
    vi.mocked(genresService.add).mockResolvedValue('drama');
    const { result } = renderHook(() => useGenres());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.add('drama');
    });

    expect(result.current.genres).toEqual(['Drama']);
  });

  it('add devuelve null para nombre vacío', async () => {
    vi.mocked(genresService.getAll).mockResolvedValue([]);
    vi.mocked(genresService.add).mockResolvedValue(null);
    const { result } = renderHook(() => useGenres());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let returned: string | null = 'x';
    await act(async () => {
      returned = await result.current.add('   ');
    });

    expect(returned).toBeNull();
  });
});

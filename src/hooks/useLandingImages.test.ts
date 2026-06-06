import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLandingImages } from './useLandingImages';
import type { Series } from '@/types';

const { mockGetAll, mockGet } = vi.hoisted(() => ({
  mockGetAll: vi.fn(),
  mockGet: vi.fn(),
}));

vi.mock('@/services/seriesService', () => ({
  seriesService: { getAll: mockGetAll },
}));

vi.mock('@/services/imageService', () => ({
  imageService: { get: mockGet },
}));

const MOCK_BLOB = new Blob(['img'], { type: 'image/jpeg' });

const makeSeries = (id: string, coverImage: string): Series => ({
  id,
  title: `Serie ${id}`,
  synopsis: 'S',
  seasons: 1,
  cast: [],
  year: 2020,
  rating: 4,
  genres: ['Drama'],
  coverImage,
  createdBy: 'u1',
  createdAt: '',
  updatedAt: '',
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn((b: Blob) => `blob:${b.size}`),
    revokeObjectURL: vi.fn(),
  });
});

describe('useLandingImages', () => {
  it('devuelve loading true inicialmente', () => {
    mockGetAll.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useLandingImages());
    expect(result.current.loading).toBe(true);
  });

  it('carga las imágenes cuando hay series con portada', async () => {
    mockGetAll.mockResolvedValue([makeSeries('s1', 'img-1'), makeSeries('s2', 'img-2')]);
    mockGet.mockResolvedValue(MOCK_BLOB);

    const { result } = renderHook(() => useLandingImages());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.images).toHaveLength(2);
    expect(result.current.hasFallback).toBe(false);
  });

  it('hasFallback es true cuando no hay series', async () => {
    mockGetAll.mockResolvedValue([]);

    const { result } = renderHook(() => useLandingImages());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.images).toHaveLength(0);
    expect(result.current.hasFallback).toBe(true);
  });

  it('ignora series sin coverImage', async () => {
    const seriesWithoutCover = { ...makeSeries('s1', ''), coverImage: '' };
    mockGetAll.mockResolvedValue([seriesWithoutCover]);

    const { result } = renderHook(() => useLandingImages());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.images).toHaveLength(0);
    expect(result.current.hasFallback).toBe(true);
  });

  it('revoca las ObjectURL al desmontar', async () => {
    mockGetAll.mockResolvedValue([makeSeries('s1', 'img-1')]);
    mockGet.mockResolvedValue(MOCK_BLOB);

    const { result, unmount } = renderHook(() => useLandingImages());
    await waitFor(() => expect(result.current.images).toHaveLength(1));

    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
});

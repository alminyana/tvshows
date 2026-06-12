import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Series } from '../types/series';

const mockDb = vi.hoisted(() => ({
  series: {
    toArray: vi.fn(),
    get: vi.fn(),
    add: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../db/database', () => ({ db: mockDb }));

import { seriesService } from './seriesService';

const mockSeries: Series = {
  id: 'abc-123',
  title: 'Test Series',
  synopsis: 'Una sinopsis de prueba',
  seasons: '2 temporadas',
  cast: ['Actor A'],
  year: 2020,
  rating: 4,
  genres: ['Drama'],
  coverImage: 'img-1',
  createdBy: 'user-1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('seriesService.getAll', () => {
  it('devuelve todas las series', async () => {
    mockDb.series.toArray.mockResolvedValue([mockSeries]);
    const result = await seriesService.getAll();
    expect(result).toEqual([mockSeries]);
  });
});

describe('seriesService.getById', () => {
  it('devuelve la serie si existe', async () => {
    mockDb.series.get.mockResolvedValue(mockSeries);
    const result = await seriesService.getById('abc-123');
    expect(result).toEqual(mockSeries);
    expect(mockDb.series.get).toHaveBeenCalledWith('abc-123');
  });

  it('devuelve undefined si no existe', async () => {
    mockDb.series.get.mockResolvedValue(undefined);
    const result = await seriesService.getById('no-existe');
    expect(result).toBeUndefined();
  });
});

describe('seriesService.create', () => {
  it('crea una serie con id, createdAt y updatedAt generados', async () => {
    mockDb.series.add.mockResolvedValue(undefined);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, updatedAt, ...input } = mockSeries;
    const result = await seriesService.create(input);
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeDefined();
    expect(result.updatedAt).toBeDefined();
    expect(result.title).toBe(mockSeries.title);
    expect(mockDb.series.add).toHaveBeenCalledOnce();
  });
});

describe('seriesService.update', () => {
  it('actualiza los campos y renueva updatedAt', async () => {
    mockDb.series.get.mockResolvedValue(mockSeries);
    mockDb.series.put.mockResolvedValue(undefined);
    const result = await seriesService.update('abc-123', { title: 'Nuevo título' });
    expect(result.title).toBe('Nuevo título');
    expect(result.updatedAt).not.toBe(mockSeries.updatedAt);
  });

  it('lanza error si la serie no existe', async () => {
    mockDb.series.get.mockResolvedValue(undefined);
    await expect(seriesService.update('no-existe', {})).rejects.toThrow();
  });
});

describe('seriesService.remove', () => {
  it('llama a delete con el id correcto', async () => {
    mockDb.series.delete.mockResolvedValue(undefined);
    await seriesService.remove('abc-123');
    expect(mockDb.series.delete).toHaveBeenCalledWith('abc-123');
  });
});

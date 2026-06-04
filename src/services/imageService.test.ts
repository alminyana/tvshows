import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDb = vi.hoisted(() => ({
  images: {
    add: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../db/database', () => ({ db: mockDb }));

import { imageService } from './imageService';

const mockBlob = new Blob(['fake'], { type: 'image/png' });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('imageService.save', () => {
  it('guarda el blob y devuelve un id', async () => {
    mockDb.images.add.mockResolvedValue(undefined);
    const id = await imageService.save(mockBlob);
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
    expect(mockDb.images.add).toHaveBeenCalledWith({ id, blob: mockBlob });
  });
});

describe('imageService.get', () => {
  it('devuelve el blob si existe el registro', async () => {
    mockDb.images.get.mockResolvedValue({ id: 'img-1', blob: mockBlob });
    const result = await imageService.get('img-1');
    expect(result).toBe(mockBlob);
  });

  it('devuelve undefined si no existe el registro', async () => {
    mockDb.images.get.mockResolvedValue(undefined);
    const result = await imageService.get('no-existe');
    expect(result).toBeUndefined();
  });
});

describe('imageService.remove', () => {
  it('llama a delete con el id correcto', async () => {
    mockDb.images.delete.mockResolvedValue(undefined);
    await imageService.remove('img-1');
    expect(mockDb.images.delete).toHaveBeenCalledWith('img-1');
  });
});

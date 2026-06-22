import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockStorage = vi.hoisted(() => ({
  upload: vi.fn(),
  remove: vi.fn(),
  getPublicUrl: vi.fn(),
}));

const mockSupabase = vi.hoisted(() => ({
  storage: {
    from: vi.fn(() => mockStorage),
  },
}));

vi.mock('@/lib/supabase', () => ({ supabase: mockSupabase }));

import { imageServiceSupabase } from './imageService.supabase';

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabase.storage.from.mockReturnValue(mockStorage);
});

describe('imageServiceSupabase.save', () => {
  it('sube el fichero al bucket y devuelve el path', async () => {
    mockStorage.upload.mockResolvedValue({ error: null });
    const file = new File(['data'], 'cover.jpg', { type: 'image/jpeg' });
    const path = await imageServiceSupabase.save(file);
    expect(path).toMatch(/\.jpg$/);
    expect(mockSupabase.storage.from).toHaveBeenCalledWith('covers');
    expect(mockStorage.upload).toHaveBeenCalledWith(path, file);
  });

  it('lanza error si Storage falla en la subida', async () => {
    mockStorage.upload.mockResolvedValue({ error: { message: 'Upload failed' } });
    const file = new File(['data'], 'cover.png', { type: 'image/png' });
    await expect(imageServiceSupabase.save(file)).rejects.toMatchObject({
      message: 'Upload failed',
    });
  });
});

describe('imageServiceSupabase.getUrl', () => {
  it('devuelve la URL pública del path', () => {
    mockStorage.getPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://supabase.co/storage/v1/covers/abc.jpg' },
    });
    const url = imageServiceSupabase.getUrl('abc.jpg');
    expect(url).toBe('https://supabase.co/storage/v1/covers/abc.jpg');
    expect(mockStorage.getPublicUrl).toHaveBeenCalledWith('abc.jpg');
  });
});

describe('imageServiceSupabase.getSrc', () => {
  it('devuelve la URL pública como src', async () => {
    mockStorage.getPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://supabase.co/storage/v1/covers/abc.jpg' },
    });
    const src = await imageServiceSupabase.getSrc('abc.jpg');
    expect(src).toBe('https://supabase.co/storage/v1/covers/abc.jpg');
  });

  it('devuelve undefined si el path está vacío', async () => {
    const src = await imageServiceSupabase.getSrc('');
    expect(src).toBeUndefined();
  });
});

describe('imageServiceSupabase.remove', () => {
  it('elimina el fichero del bucket', async () => {
    mockStorage.remove.mockResolvedValue({ error: null });
    await imageServiceSupabase.remove('covers/abc.jpg');
    expect(mockStorage.remove).toHaveBeenCalledWith(['covers/abc.jpg']);
  });

  it('lanza error si Storage falla al borrar', async () => {
    mockStorage.remove.mockResolvedValue({ error: { message: 'Delete failed' } });
    await expect(imageServiceSupabase.remove('covers/abc.jpg')).rejects.toMatchObject({
      message: 'Delete failed',
    });
  });
});

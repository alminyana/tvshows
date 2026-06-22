import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSupabase = vi.hoisted(() => {
  const chain = {
    select: vi.fn(),
    insert: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
    in: vi.fn(),
  };
  Object.values(chain).forEach((fn) => {
    fn.mockReturnValue(chain);
  });
  return {
    from: vi.fn(() => chain),
    _chain: chain,
  };
});

vi.mock('@/lib/supabase', () => ({ supabase: mockSupabase }));

import { genresServiceSupabase } from './genresService.supabase';

beforeEach(() => {
  vi.clearAllMocks();
  const chain = mockSupabase._chain;
  Object.values(chain).forEach((fn) => {
    (fn as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  });
  mockSupabase.from.mockReturnValue(chain);
});

describe('genresServiceSupabase.getAll', () => {
  it('devuelve los nombres de géneros ordenados', async () => {
    mockSupabase._chain.order.mockResolvedValue({
      data: [{ name: 'Acción' }, { name: 'Drama' }],
      error: null,
    });
    const result = await genresServiceSupabase.getAll();
    expect(result).toEqual(['Acción', 'Drama']);
  });

  it('lanza error si Supabase falla', async () => {
    mockSupabase._chain.order.mockResolvedValue({ data: null, error: { message: 'DB error' } });
    await expect(genresServiceSupabase.getAll()).rejects.toMatchObject({ message: 'DB error' });
  });
});

describe('genresServiceSupabase.add', () => {
  it('devuelve null si el nombre está vacío', async () => {
    const result = await genresServiceSupabase.add('   ');
    expect(result).toBeNull();
  });

  it('inserta el género y devuelve el nombre', async () => {
    mockSupabase._chain.single.mockResolvedValue({ data: { name: 'Ciencia ficción' }, error: null });
    const result = await genresServiceSupabase.add('Ciencia ficción');
    expect(result).toBe('Ciencia ficción');
  });

  it('devuelve el nombre si el género ya existe (unique_violation)', async () => {
    mockSupabase._chain.single.mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'unique' },
    });
    const result = await genresServiceSupabase.add('Drama');
    expect(result).toBe('Drama');
  });

  it('lanza error en cualquier otro fallo de BD', async () => {
    mockSupabase._chain.single.mockResolvedValue({
      data: null,
      error: { code: '42P01', message: 'tabla no existe' },
    });
    await expect(genresServiceSupabase.add('Drama')).rejects.toMatchObject({ code: '42P01' });
  });
});

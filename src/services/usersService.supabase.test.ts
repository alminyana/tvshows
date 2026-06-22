import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from '../types/user';

const mockSupabase = vi.hoisted(() => {
  const chain = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
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

import { usersServiceSupabase } from './usersService.supabase';

const profileRow = {
  id: 'user-1',
  email: 'admin@local',
  role: 'admin',
  created_at: '2024-01-01T00:00:00.000Z',
};

const expectedUser: User = {
  id: 'user-1',
  email: 'admin@local',
  role: 'admin',
  password: '',
  createdAt: '2024-01-01T00:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  const chain = mockSupabase._chain;
  Object.values(chain).forEach((fn) => {
    (fn as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  });
  mockSupabase.from.mockReturnValue(chain);
});

describe('usersServiceSupabase.getAll', () => {
  it('mapea profiles a User[]', async () => {
    mockSupabase._chain.order.mockResolvedValue({ data: [profileRow], error: null });
    const result = await usersServiceSupabase.getAll();
    expect(result).toEqual([expectedUser]);
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
  });

  it('lanza error si Supabase falla', async () => {
    mockSupabase._chain.order.mockResolvedValue({ data: null, error: { message: 'DB error' } });
    await expect(usersServiceSupabase.getAll()).rejects.toMatchObject({ message: 'DB error' });
  });
});

describe('usersServiceSupabase.getById', () => {
  it('devuelve el usuario mapeado si existe', async () => {
    mockSupabase._chain.single.mockResolvedValue({ data: profileRow, error: null });
    const result = await usersServiceSupabase.getById('user-1');
    expect(result).toEqual(expectedUser);
  });

  it('devuelve undefined si PGRST116', async () => {
    mockSupabase._chain.single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'Not found' },
    });
    const result = await usersServiceSupabase.getById('no-existe');
    expect(result).toBeUndefined();
  });
});

describe('usersServiceSupabase — métodos de escritura (stubs F4)', () => {
  it('create lanza error indicando que requiere F4', async () => {
    await expect(
      usersServiceSupabase.create({ email: 'x@x.com', password: '1234', role: 'user' })
    ).rejects.toThrow();
  });

  it('update lanza error indicando que requiere F4', async () => {
    await expect(usersServiceSupabase.update('user-1', { email: 'new@x.com' })).rejects.toThrow();
  });

  it('remove lanza error indicando que requiere F4', async () => {
    await expect(usersServiceSupabase.remove('user-1', 'user-2')).rejects.toThrow();
  });
});

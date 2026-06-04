import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from '../types/user';

const mockDb = vi.hoisted(() => ({
  users: {
    toArray: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock('../db/database', () => ({ db: mockDb }));

import { usersService } from './usersService';

const mockUser: User = {
  id: 'user-1',
  email: 'admin@local.dev',
  password: 'hashed',
  role: 'admin',
  createdAt: '2024-01-01T00:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('usersService.getAll', () => {
  it('devuelve todos los usuarios', async () => {
    mockDb.users.toArray.mockResolvedValue([mockUser]);
    const result = await usersService.getAll();
    expect(result).toEqual([mockUser]);
  });
});

describe('usersService.getById', () => {
  it('devuelve el usuario si existe', async () => {
    mockDb.users.get.mockResolvedValue(mockUser);
    const result = await usersService.getById('user-1');
    expect(result).toEqual(mockUser);
    expect(mockDb.users.get).toHaveBeenCalledWith('user-1');
  });

  it('devuelve undefined si no existe', async () => {
    mockDb.users.get.mockResolvedValue(undefined);
    const result = await usersService.getById('no-existe');
    expect(result).toBeUndefined();
  });
});

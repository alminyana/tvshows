import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from '../types/user';

const mockFirst = vi.hoisted(() => vi.fn());
const mockEquals = vi.hoisted(() => vi.fn(() => ({ first: mockFirst })));
const mockDb = vi.hoisted(() => ({
  users: {
    where: vi.fn(() => ({ equals: mockEquals })),
    get: vi.fn(),
  },
}));

vi.mock('../db/database', () => ({ db: mockDb }));
vi.mock('../utils/hashPassword', () => ({
  hashPassword: vi.fn((p: string) => Promise.resolve(`hashed:${p}`)),
}));

import { authService } from './authService';

const mockUser: User = {
  id: 'user-1',
  email: 'admin@local',
  password: 'hashed:admin',
  role: 'admin',
  createdAt: '2024-01-01T00:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mockDb.users.where.mockReturnValue({ equals: mockEquals });
  mockEquals.mockReturnValue({ first: mockFirst });
});

describe('authService.login', () => {
  it('devuelve el usuario y guarda la sesión si las credenciales son correctas', async () => {
    mockFirst.mockResolvedValue(mockUser);
    const result = await authService.login('admin@local', 'admin');
    expect(result).toEqual(mockUser);
    const stored = JSON.parse(localStorage.getItem('tv-shows:session')!);
    expect(stored.userId).toBe('user-1');
  });

  it('lanza error si el usuario no existe', async () => {
    mockFirst.mockResolvedValue(undefined);
    await expect(authService.login('noexiste@local', 'pass')).rejects.toThrow();
  });

  it('lanza error si el hash no coincide', async () => {
    mockFirst.mockResolvedValue({ ...mockUser, password: 'hashed:otro' });
    await expect(authService.login('admin@local', 'admin')).rejects.toThrow();
  });
});

describe('authService.logout', () => {
  it('elimina la sesión del localStorage', async () => {
    localStorage.setItem('tv-shows:session', JSON.stringify({ userId: 'user-1' }));
    await authService.logout();
    expect(localStorage.getItem('tv-shows:session')).toBeNull();
  });
});

describe('authService.getCurrentUser', () => {
  it('devuelve null si no hay sesión', async () => {
    const result = await authService.getCurrentUser();
    expect(result).toBeNull();
  });

  it('devuelve el usuario si hay sesión válida', async () => {
    localStorage.setItem('tv-shows:session', JSON.stringify({ userId: 'user-1' }));
    mockDb.users.get.mockResolvedValue(mockUser);
    const result = await authService.getCurrentUser();
    expect(result).toEqual(mockUser);
    expect(mockDb.users.get).toHaveBeenCalledWith('user-1');
  });

  it('devuelve null si el userId ya no existe en la BD', async () => {
    localStorage.setItem('tv-shows:session', JSON.stringify({ userId: 'borrado' }));
    mockDb.users.get.mockResolvedValue(undefined);
    const result = await authService.getCurrentUser();
    expect(result).toBeNull();
  });
});

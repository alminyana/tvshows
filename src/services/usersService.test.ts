import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from '../types/user';

const mockFirst = vi.hoisted(() => vi.fn());
const mockEquals = vi.hoisted(() => vi.fn(() => ({ first: mockFirst })));
const mockDb = vi.hoisted(() => ({
  users: {
    toArray: vi.fn(),
    get: vi.fn(),
    add: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    where: vi.fn(() => ({ equals: mockEquals })),
  },
}));

vi.mock('../db/database', () => ({ db: mockDb }));
vi.mock('../utils/hashPassword', () => ({
  hashPassword: vi.fn((p: string) => Promise.resolve(`hashed:${p}`)),
}));

import { usersService } from './usersService';

const mockUser: User = {
  id: 'user-1',
  email: 'admin@example.com',
  password: 'hashed:admin',
  role: 'admin',
  createdAt: '2024-01-01T00:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  mockDb.users.where.mockReturnValue({ equals: mockEquals });
  mockEquals.mockReturnValue({ first: mockFirst });
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

describe('usersService.create', () => {
  it('crea el usuario con password hasheado', async () => {
    mockFirst.mockResolvedValue(undefined);
    mockDb.users.add.mockResolvedValue('user-new');

    const result = await usersService.create({
      email: 'nuevo@example.com',
      password: 'pass123',
      role: 'user',
    });

    expect(result.email).toBe('nuevo@example.com');
    expect(result.password).toBe('hashed:pass123');
    expect(result.role).toBe('user');
    expect(result.id).toBeDefined();
    expect(mockDb.users.add).toHaveBeenCalledWith(expect.objectContaining({ email: 'nuevo@example.com' }));
  });

  it('lanza error si el email ya está en uso', async () => {
    mockFirst.mockResolvedValue(mockUser);

    await expect(
      usersService.create({ email: 'admin@example.com', password: 'pass123', role: 'user' })
    ).rejects.toThrow('El email ya está en uso.');
  });
});

describe('usersService.update', () => {
  it('actualiza email y role', async () => {
    mockDb.users.get.mockResolvedValue(mockUser);
    mockFirst.mockResolvedValue(undefined);
    mockDb.users.put.mockResolvedValue('user-1');

    const result = await usersService.update('user-1', { email: 'nuevo@example.com', role: 'user' });

    expect(result.email).toBe('nuevo@example.com');
    expect(result.role).toBe('user');
    expect(result.password).toBe(mockUser.password);
  });

  it('hashea la password si se proporciona', async () => {
    mockDb.users.get.mockResolvedValue(mockUser);
    mockFirst.mockResolvedValue(undefined);
    mockDb.users.put.mockResolvedValue('user-1');

    const result = await usersService.update('user-1', { password: 'nuevapass' });

    expect(result.password).toBe('hashed:nuevapass');
  });

  it('no cambia la password si no se proporciona', async () => {
    mockDb.users.get.mockResolvedValue(mockUser);
    mockDb.users.put.mockResolvedValue('user-1');

    const result = await usersService.update('user-1', { role: 'user' });

    expect(result.password).toBe(mockUser.password);
  });

  it('lanza error si el usuario no existe', async () => {
    mockDb.users.get.mockResolvedValue(undefined);

    await expect(usersService.update('no-existe', { role: 'user' })).rejects.toThrow(
      'Usuario no encontrado: no-existe'
    );
  });

  it('lanza error si el nuevo email ya está en uso por otro usuario', async () => {
    mockDb.users.get.mockResolvedValue(mockUser);
    mockFirst.mockResolvedValue({ ...mockUser, id: 'otro-user' });

    await expect(
      usersService.update('user-1', { email: 'otro@example.com' })
    ).rejects.toThrow('El email ya está en uso.');
  });

  it('no comprueba unicidad si el email no cambia', async () => {
    mockDb.users.get.mockResolvedValue(mockUser);
    mockDb.users.put.mockResolvedValue('user-1');

    await usersService.update('user-1', { email: mockUser.email });

    expect(mockDb.users.where).not.toHaveBeenCalled();
  });
});

describe('usersService.remove', () => {
  it('elimina el usuario correctamente', async () => {
    mockDb.users.delete.mockResolvedValue(undefined);

    await usersService.remove('user-2', 'user-1');

    expect(mockDb.users.delete).toHaveBeenCalledWith('user-2');
  });

  it('lanza error si se intenta eliminar el propio usuario', async () => {
    await expect(usersService.remove('user-1', 'user-1')).rejects.toThrow(
      'No puedes eliminar tu propia cuenta.'
    );
    expect(mockDb.users.delete).not.toHaveBeenCalled();
  });
});

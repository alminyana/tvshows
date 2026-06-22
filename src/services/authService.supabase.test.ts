import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from '../types/user';

const profileRow = {
  id: 'user-1',
  email: 'admin@example.com',
  role: 'admin',
  created_at: '2024-01-01T00:00:00.000Z',
};

const expectedUser: User = {
  id: 'user-1',
  email: 'admin@example.com',
  role: 'admin',
  password: '',
  createdAt: '2024-01-01T00:00:00.000Z',
};

const mockProfileChain = vi.hoisted(() => ({
  select: vi.fn(),
  eq: vi.fn(),
  single: vi.fn(),
}));

const mockSupabase = vi.hoisted(() => ({
  auth: {
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn(() => mockProfileChain),
}));

vi.mock('@/lib/supabase', () => ({ supabase: mockSupabase }));

import { authServiceSupabase } from './authService.supabase';

beforeEach(() => {
  vi.clearAllMocks();
  mockProfileChain.select.mockReturnValue(mockProfileChain);
  mockProfileChain.eq.mockReturnValue(mockProfileChain);
  mockSupabase.from.mockReturnValue(mockProfileChain);
});

describe('authServiceSupabase.login', () => {
  it('devuelve el usuario con el role de profiles si las credenciales son correctas', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    mockProfileChain.single.mockResolvedValue({ data: profileRow, error: null });

    const result = await authServiceSupabase.login('admin@example.com', 'pass');

    expect(result).toEqual(expectedUser);
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'pass',
    });
  });

  it('lanza el error de Supabase si las credenciales son incorrectas', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    });

    await expect(authServiceSupabase.login('x@x.com', 'wrong')).rejects.toMatchObject({
      message: 'Invalid login credentials',
    });
  });

  it('lanza error si el perfil no existe tras autenticar', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    mockProfileChain.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

    await expect(authServiceSupabase.login('admin@example.com', 'pass')).rejects.toThrow();
  });
});

describe('authServiceSupabase.logout', () => {
  it('llama a signOut sin error', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });
    await expect(authServiceSupabase.logout()).resolves.toBeUndefined();
    expect(mockSupabase.auth.signOut).toHaveBeenCalledOnce();
  });

  it('lanza error si signOut falla', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: { message: 'Network error' } });
    await expect(authServiceSupabase.logout()).rejects.toMatchObject({ message: 'Network error' });
  });
});

describe('authServiceSupabase.getCurrentUser', () => {
  it('devuelve null si no hay sesión activa', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    const result = await authServiceSupabase.getCurrentUser();
    expect(result).toBeNull();
  });

  it('devuelve el usuario del profile si hay sesión', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'user-1' } } },
    });
    mockProfileChain.single.mockResolvedValue({ data: profileRow, error: null });

    const result = await authServiceSupabase.getCurrentUser();
    expect(result).toEqual(expectedUser);
  });
});

describe('authServiceSupabase.subscribe', () => {
  it('devuelve una función de cleanup que llama a unsubscribe', () => {
    const unsubscribe = vi.fn();
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe } },
    });

    const cleanup = authServiceSupabase.subscribe(vi.fn());
    cleanup();

    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it('llama al callback con null cuando la sesión se cierra', async () => {
    mockSupabase.auth.onAuthStateChange.mockImplementation((cb) => {
      cb('SIGNED_OUT', null);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    const callback = vi.fn();
    authServiceSupabase.subscribe(callback);

    await vi.waitFor(() => expect(callback).toHaveBeenCalledWith(null));
  });

  it('llama al callback con el usuario cuando hay sesión', async () => {
    mockProfileChain.single.mockResolvedValue({ data: profileRow, error: null });
    mockSupabase.auth.onAuthStateChange.mockImplementation((cb) => {
      cb('SIGNED_IN', { user: { id: 'user-1' } });
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    const callback = vi.fn();
    authServiceSupabase.subscribe(callback);

    await vi.waitFor(() => expect(callback).toHaveBeenCalledWith(expectedUser));
  });
});

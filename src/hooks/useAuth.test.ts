import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from './useAuth';

vi.mock('@/context', () => ({
  AuthContext: {
    _currentValue: null,
  },
}));

import { useContext } from 'react';

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return { ...actual, useContext: vi.fn() };
});

describe('useAuth', () => {
  it('lanza error si se usa fuera de AuthProvider', () => {
    vi.mocked(useContext).mockReturnValue(null);
    expect(() => renderHook(() => useAuth())).toThrow('useAuth debe usarse dentro de AuthProvider');
  });

  it('devuelve el contexto cuando está disponible', () => {
    const mockValue = {
      user: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    };
    vi.mocked(useContext).mockReturnValue(mockValue);
    const { result } = renderHook(() => useAuth());
    expect(result.current).toBe(mockValue);
  });
});

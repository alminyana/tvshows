import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSeriesViewMode } from './useSeriesViewMode';

const STORAGE_KEY = 'tv-shows:series-view-mode';

beforeEach(() => {
  localStorage.clear();
});

describe('useSeriesViewMode', () => {
  it('devuelve "cards" por defecto cuando localStorage está vacío', () => {
    const { result } = renderHook(() => useSeriesViewMode());
    expect(result.current[0]).toBe('cards');
  });

  it('lee el valor guardado de localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'list');
    const { result } = renderHook(() => useSeriesViewMode());
    expect(result.current[0]).toBe('list');
  });

  it('cae a "cards" si el valor en localStorage es inválido', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid-value');
    const { result } = renderHook(() => useSeriesViewMode());
    expect(result.current[0]).toBe('cards');
  });

  it('persiste el nuevo modo en localStorage al llamar setMode', () => {
    const { result } = renderHook(() => useSeriesViewMode());
    act(() => {
      result.current[1]('list');
    });
    expect(localStorage.getItem(STORAGE_KEY)).toBe('list');
    expect(result.current[0]).toBe('list');
  });

  it('puede volver a "cards" desde "list"', () => {
    localStorage.setItem(STORAGE_KEY, 'list');
    const { result } = renderHook(() => useSeriesViewMode());
    act(() => {
      result.current[1]('cards');
    });
    expect(result.current[0]).toBe('cards');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('cards');
  });
});

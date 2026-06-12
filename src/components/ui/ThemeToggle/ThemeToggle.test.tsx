import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';

const mockToggleMode = vi.fn();

vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    useTheme: vi.fn(() => ({
      mode: 'light',
      theme: 'default',
      setTheme: vi.fn(),
      setMode: vi.fn(),
      toggleMode: mockToggleMode,
    })),
  };
});

import { useTheme } from '@/hooks';

describe('ThemeToggle', () => {
  it('muestra aria-label "Cambiar a modo oscuro" en modo claro', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'light',
      theme: 'default',
      setTheme: vi.fn(),
      setMode: vi.fn(),
      toggleMode: mockToggleMode,
    });
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: /cambiar a modo oscuro/i })).toBeInTheDocument();
  });

  it('muestra aria-label "Cambiar a modo claro" en modo oscuro', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark',
      theme: 'default',
      setTheme: vi.fn(),
      setMode: vi.fn(),
      toggleMode: mockToggleMode,
    });
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: /cambiar a modo claro/i })).toBeInTheDocument();
  });

  it('llama a toggleMode al hacer click', async () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'light',
      theme: 'default',
      setTheme: vi.fn(),
      setMode: vi.fn(),
      toggleMode: mockToggleMode,
    });
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button'));
    expect(mockToggleMode).toHaveBeenCalledOnce();
  });
});

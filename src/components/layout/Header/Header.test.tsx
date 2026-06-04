import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/context';
import { Header } from './Header';

vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    useAuth: vi.fn(() => ({
      user: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    })),
  };
});

import { useAuth } from '@/hooks';

function renderHeader() {
  return render(
    <ThemeProvider>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Header />
      </MemoryRouter>
    </ThemeProvider>,
  );
}

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, login: vi.fn(), logout: vi.fn() });
});

describe('Header', () => {
  it('renderiza el logo', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: /tv shows/i })).toBeInTheDocument();
  });

  it('los enlaces de navegación existen en el DOM', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: /series/i, hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /dashboard/i, hidden: true })).toBeInTheDocument();
  });

  it('el botón de modo existe en el DOM', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: /cambiar modo/i, hidden: true })).toBeInTheDocument();
  });

  it('muestra el botón de login cuando no hay sesión', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('muestra el email y el botón de logout cuando hay sesión', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '1', email: 'admin@local.dev', password: 'h', role: 'admin', createdAt: '' },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
    renderHeader();
    expect(screen.getByText('admin@local.dev')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
  });

  it('el botón hamburguesa abre y cierra el menú', async () => {
    renderHeader();
    const hamburger = screen.getByRole('button', { name: /abrir menú/i });
    expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(hamburger);
    expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(hamburger);
    expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  });
});

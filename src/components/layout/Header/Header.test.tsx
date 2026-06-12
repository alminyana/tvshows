import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/context';
import { Header } from './Header';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

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
  mockNavigate.mockReset();
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

  it('el toggle de tema existe en el DOM', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: /cambiar a modo/i, hidden: true })).toBeInTheDocument();
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

  it('logout navega a "/" tras cerrar sesión', async () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '1', email: 'admin@local.dev', password: 'h', role: 'admin', createdAt: '' },
      loading: false,
      login: vi.fn(),
      logout,
    });
    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }));
    expect(logout).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith('/');
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

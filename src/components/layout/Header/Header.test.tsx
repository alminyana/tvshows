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

vi.mock('@/components/features', () => ({
  LoginModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="login-modal">Modal</div> : null,
}));

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
  // ThemeProvider lee el tema de localStorage al montar: sin limpiar, el tema
  // elegido en un test se filtraría al siguiente.
  localStorage.clear();
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

  it('el selector de tema vive dentro del panel del menú', () => {
    const { container } = renderHeader();
    const select = screen.getByRole('combobox', { name: /tema/i, hidden: true });
    const toggle = screen.getByRole('button', { name: /cambiar a modo/i, hidden: true });
    const panel = container.querySelector('#header-menu');

    expect(panel).not.toBeNull();
    expect(panel).toContainElement(select);
    expect(panel).toContainElement(toggle);
  });

  it('cambiar de tema actualiza data-theme en el documento', async () => {
    renderHeader();
    const select = screen.getByRole('combobox', { name: /tema/i, hidden: true });
    await userEvent.selectOptions(select, 'ocean');
    expect(document.documentElement.dataset.theme).toBe('ocean');
  });

  it('muestra el botón de login cuando no hay sesión', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('abre el modal de login al pulsar el botón de login', async () => {
    renderHeader();
    expect(screen.queryByTestId('login-modal')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    expect(screen.getByTestId('login-modal')).toBeInTheDocument();
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

  it('el nombre accesible de la hamburguesa alterna abrir/cerrar', async () => {
    renderHeader();
    const hamburger = screen.getByRole('button', { name: /abrir menú/i });
    await userEvent.click(hamburger);
    expect(hamburger).toHaveAccessibleName(/cerrar menú/i);
    await userEvent.click(hamburger);
    expect(hamburger).toHaveAccessibleName(/abrir menú/i);
  });

  it('la hamburguesa apunta al panel real vía aria-controls', () => {
    const { container } = renderHeader();
    const hamburger = screen.getByRole('button', { name: /abrir menú/i });
    const id = hamburger.getAttribute('aria-controls');
    expect(container.querySelector(`#${id}`)).not.toBeNull();
  });

  it('Escape cierra el menú y devuelve el foco a la hamburguesa', async () => {
    renderHeader();
    const hamburger = screen.getByRole('button', { name: /abrir menú/i });
    await userEvent.click(hamburger);
    expect(hamburger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.keyboard('{Escape}');
    expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(hamburger);
  });

  it('un click fuera del header cierra el menú', async () => {
    renderHeader();
    const hamburger = screen.getByRole('button', { name: /abrir menú/i });
    await userEvent.click(hamburger);
    expect(hamburger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(document.body);
    expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/hooks', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    login: mockLogin,
    logout: vi.fn(),
  })),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null, pathname: '/login', search: '', hash: '', key: '' }),
  };
});

function renderLogin() {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LoginPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginPage', () => {
  it('renderiza el formulario de login', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('muestra errores de validación si se envía vacío', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('muestra error de email inválido', async () => {
    renderLogin();
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'no-es-email');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'pass');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getByText(/email no válido/i)).toBeInTheDocument();
    });
  });

  it('llama a login y navega si las credenciales son correctas', async () => {
    mockLogin.mockResolvedValue(undefined);
    renderLogin();
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'admin@example.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'admin');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('admin@example.com', 'admin'));
    expect(mockNavigate).toHaveBeenCalledWith('/series', { replace: true });
  });

  it('muestra error de credenciales si login falla', async () => {
    mockLogin.mockRejectedValue(new Error('Credenciales incorrectas'));
    renderLogin();
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'admin@example.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'mal');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/email o contraseña incorrectos/i);
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

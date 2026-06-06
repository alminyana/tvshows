import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from './LoginForm';

const mockLogin = vi.fn();

vi.mock('@/hooks', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    login: mockLogin,
    logout: vi.fn(),
  })),
}));

function renderForm(onSuccess = vi.fn()) {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LoginForm onSuccess={onSuccess} />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginForm', () => {
  it('renderiza los campos del formulario', () => {
    renderForm();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('muestra errores de validación si se envía vacío', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('llama a login y a onSuccess cuando las credenciales son correctas', async () => {
    mockLogin.mockResolvedValue(undefined);
    const onSuccess = vi.fn();
    renderForm(onSuccess);
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'admin@example.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'admin');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('admin@example.com', 'admin'));
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('muestra error de credenciales si login falla', async () => {
    mockLogin.mockRejectedValue(new Error('KO'));
    renderForm();
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'admin@example.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'mal');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/email o contraseña incorrectos/i);
    });
  });
});

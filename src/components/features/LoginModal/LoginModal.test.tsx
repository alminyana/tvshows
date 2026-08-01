import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginModal } from './LoginModal';

const mockLogin = vi.fn();

vi.mock('@/hooks', () => ({
  useAuth: vi.fn(() => ({ user: null, loading: false, login: mockLogin, logout: vi.fn() })),
}));

function renderModal(isOpen = true, onClose = vi.fn()) {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LoginModal isOpen={isOpen} onClose={onClose} />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginModal', () => {
  it('no renderiza nada si isOpen es false', () => {
    renderModal(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('muestra el dialog con el formulario cuando isOpen es true', () => {
    renderModal(true);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it('llama a onClose al pulsar Escape', async () => {
    const onClose = vi.fn();
    renderModal(true, onClose);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('llama a onClose tras login exitoso, sin navegar', async () => {
    mockLogin.mockResolvedValue(undefined);
    const onClose = vi.fn();
    renderModal(true, onClose);
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'admin@example.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'admin');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});

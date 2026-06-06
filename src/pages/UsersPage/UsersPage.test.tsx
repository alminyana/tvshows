import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsersPage } from './UsersPage';
import type { User } from '@/types/user';

vi.mock('@/hooks', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'u1', email: 'admin@example.com', password: 'h', role: 'admin', createdAt: '' },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  })),
  useNotification: vi.fn(() => ({ notify: vi.fn() })),
}));

vi.mock('@/services', () => ({
  usersService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
  authService: { getCurrentUser: vi.fn().mockResolvedValue(null) },
  seriesService: { getAll: vi.fn().mockResolvedValue([]) },
  imageService: { get: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock('@/components/features', () => ({
  UserList: vi.fn(
    ({
      users,
      currentUserId,
      onEdit,
      onDelete,
    }: {
      users: User[];
      currentUserId: string;
      onEdit: (u: User) => void;
      onDelete: (u: User) => void;
    }) => (
      <div data-testid="user-list">
        {users.map((u) => (
          <div key={u.id}>
            <span>{u.email}</span>
            <button onClick={() => onEdit(u)}>Editar {u.email}</button>
            <button onClick={() => onDelete(u)} disabled={u.id === currentUserId}>
              Eliminar {u.email}
            </button>
          </div>
        ))}
      </div>
    )
  ),
  UserForm: vi.fn(
    ({
      onSubmit,
      onCancel,
      mode,
      initialValues,
    }: {
      onSubmit: (d: { email: string; password: string; role: 'admin' | 'user' }) => Promise<void>;
      onCancel: () => void;
      mode: string;
      initialValues?: { email: string; role: 'admin' | 'user' };
    }) => (
      <div data-testid={`user-form-${mode}`}>
        {initialValues && <span data-testid="prefilled-email">{initialValues.email}</span>}
        <button
          onClick={() => onSubmit({ email: 'test@example.com', password: 'pass123', role: 'user' })}
        >
          Guardar
        </button>
        <button onClick={onCancel}>Cancelar</button>
      </div>
    )
  ),
  SeriesCard: vi.fn(() => null),
  SeriesForm: vi.fn(() => null),
}));

import { usersService } from '@/services';

const CURRENT_USER: User = {
  id: 'u1',
  email: 'admin@example.com',
  password: 'h',
  role: 'admin',
  createdAt: '',
};

const OTHER_USER: User = {
  id: 'u2',
  email: 'user@example.com',
  password: 'h',
  role: 'user',
  createdAt: '',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(usersService.getAll).mockResolvedValue([CURRENT_USER, OTHER_USER]);
  vi.mocked(usersService.create).mockResolvedValue({} as User);
  vi.mocked(usersService.update).mockResolvedValue({} as User);
  vi.mocked(usersService.remove).mockResolvedValue(undefined);
});

describe('UsersPage', () => {
  it('muestra spinner mientras carga', () => {
    vi.mocked(usersService.getAll).mockReturnValue(new Promise(() => {}));
    render(<UsersPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('muestra la lista de usuarios tras cargar', async () => {
    render(<UsersPage />);
    await waitFor(() => expect(screen.getByTestId('user-list')).toBeInTheDocument());
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('muestra el botón "Nuevo usuario"', async () => {
    render(<UsersPage />);
    await waitFor(() => screen.getByTestId('user-list'));
    expect(screen.getByRole('button', { name: /nuevo usuario/i })).toBeInTheDocument();
  });

  it('abre el modal de crear al pulsar "Nuevo usuario"', async () => {
    render(<UsersPage />);
    await waitFor(() => screen.getByTestId('user-list'));
    await userEvent.click(screen.getByRole('button', { name: /nuevo usuario/i }));
    expect(screen.getByTestId('user-form-create')).toBeInTheDocument();
  });

  it('cierra el modal de crear al pulsar Cancelar', async () => {
    render(<UsersPage />);
    await waitFor(() => screen.getByTestId('user-list'));
    await userEvent.click(screen.getByRole('button', { name: /nuevo usuario/i }));
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(screen.queryByTestId('user-form-create')).not.toBeInTheDocument();
  });

  it('crea el usuario y recarga la lista', async () => {
    render(<UsersPage />);
    await waitFor(() => screen.getByTestId('user-list'));
    await userEvent.click(screen.getByRole('button', { name: /nuevo usuario/i }));
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }));
    await waitFor(() => {
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com' })
      );
    });
    expect(usersService.getAll).toHaveBeenCalledTimes(2);
  });

  it('abre el modal de editar con los datos del usuario', async () => {
    render(<UsersPage />);
    await waitFor(() => screen.getByTestId('user-list'));
    await userEvent.click(screen.getByRole('button', { name: /editar user@example.com/i }));
    expect(screen.getByTestId('user-form-edit')).toBeInTheDocument();
    expect(screen.getByTestId('prefilled-email')).toHaveTextContent('user@example.com');
  });

  it('actualiza el usuario y recarga la lista', async () => {
    render(<UsersPage />);
    await waitFor(() => screen.getByTestId('user-list'));
    await userEvent.click(screen.getByRole('button', { name: /editar user@example.com/i }));
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }));
    await waitFor(() => {
      expect(usersService.update).toHaveBeenCalledWith('u2', expect.any(Object));
    });
    expect(usersService.getAll).toHaveBeenCalledTimes(2);
  });

  it('abre el diálogo de confirmación al pulsar eliminar', async () => {
    render(<UsersPage />);
    await waitFor(() => screen.getByTestId('user-list'));
    await userEvent.click(screen.getByRole('button', { name: /eliminar user@example.com/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('elimina el usuario tras confirmar y recarga', async () => {
    render(<UsersPage />);
    await waitFor(() => screen.getByTestId('user-list'));
    await userEvent.click(screen.getByRole('button', { name: /eliminar user@example.com/i }));
    await userEvent.click(screen.getByRole('button', { name: /confirmar/i }));
    await waitFor(() => {
      expect(usersService.remove).toHaveBeenCalledWith('u2', 'u1');
    });
    expect(usersService.getAll).toHaveBeenCalledTimes(2);
  });
});

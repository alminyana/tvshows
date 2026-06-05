import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { UserList } from './UserList';
import type { User } from '@/types/user';

const USERS: User[] = [
  { id: 'u1', email: 'admin@example.com', password: 'h', role: 'admin', createdAt: '' },
  { id: 'u2', email: 'user@example.com', password: 'h', role: 'user', createdAt: '' },
];

describe('UserList', () => {
  it('renderiza los emails de los usuarios', () => {
    render(<UserList users={USERS} currentUserId="u1" onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('renderiza los roles en español', () => {
    render(<UserList users={USERS} currentUserId="u1" onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByText('Usuario')).toBeInTheDocument();
  });

  it('deshabilita el botón eliminar para el usuario actual', () => {
    render(<UserList users={USERS} currentUserId="u1" onEdit={vi.fn()} onDelete={vi.fn()} />);
    const deleteBtn = screen.getByRole('button', { name: /eliminar admin@example.com/i });
    expect(deleteBtn).toBeDisabled();
  });

  it('habilita el botón eliminar para otros usuarios', () => {
    render(<UserList users={USERS} currentUserId="u1" onEdit={vi.fn()} onDelete={vi.fn()} />);
    const deleteBtn = screen.getByRole('button', { name: /eliminar user@example.com/i });
    expect(deleteBtn).not.toBeDisabled();
  });

  it('llama a onEdit con el usuario correcto', async () => {
    const onEdit = vi.fn();
    render(<UserList users={USERS} currentUserId="u1" onEdit={onEdit} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /editar user@example.com/i }));
    expect(onEdit).toHaveBeenCalledWith(USERS[1]);
  });

  it('llama a onDelete con el usuario correcto', async () => {
    const onDelete = vi.fn();
    render(<UserList users={USERS} currentUserId="u1" onEdit={vi.fn()} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole('button', { name: /eliminar user@example.com/i }));
    expect(onDelete).toHaveBeenCalledWith(USERS[1]);
  });

  it('muestra mensaje cuando no hay usuarios', () => {
    render(<UserList users={[]} currentUserId="u1" onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('No hay usuarios.')).toBeInTheDocument();
  });
});

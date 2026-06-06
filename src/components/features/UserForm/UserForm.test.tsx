import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { UserForm } from './UserForm';

const mockOnSubmit = vi.fn(() => Promise.resolve());
const mockOnCancel = vi.fn();

function renderForm(props: Partial<Parameters<typeof UserForm>[0]> = {}) {
  return render(
    <UserForm
      mode="create"
      onSubmit={mockOnSubmit}
      onCancel={mockOnCancel}
      {...props}
    />
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('UserForm — modo crear', () => {
  it('renderiza los campos email, password y rol', () => {
    renderForm();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rol/i)).toBeInTheDocument();
  });

  it('llama a onSubmit con datos válidos', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText(/email/i), 'nuevo@example.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'pass123');
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }));
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'nuevo@example.com', password: 'pass123' }),
        expect.anything()
      );
    });
  });

  it('muestra error si el email es inválido', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText(/email/i), 'no-es-email');
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }));
    await waitFor(() => {
      expect(screen.getByText('Email no válido.')).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('muestra error si el password tiene menos de 6 caracteres', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText(/email/i), 'ok@example.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), '123');
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }));
    await waitFor(() => {
      expect(screen.getByText('Mínimo 6 caracteres.')).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('llama a onCancel al pulsar Cancelar', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(mockOnCancel).toHaveBeenCalledOnce();
  });
});

describe('UserForm — modo editar', () => {
  it('precarga el email y el rol', () => {
    renderForm({
      mode: 'edit',
      initialValues: { email: 'existente@example.com', role: 'admin' },
    });
    expect(screen.getByLabelText<HTMLInputElement>(/email/i).value).toBe('existente@example.com');
    expect(screen.getByLabelText<HTMLSelectElement>(/rol/i).value).toBe('admin');
  });

  it('permite guardar con password vacío (sin cambio)', async () => {
    renderForm({
      mode: 'edit',
      initialValues: { email: 'existente@example.com', role: 'user' },
    });
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }));
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'existente@example.com', password: '' }),
        expect.anything()
      );
    });
  });

  it('muestra error de servidor si se proporciona', () => {
    renderForm({ mode: 'edit', serverError: 'El email ya está en uso.' });
    expect(screen.getByText('El email ya está en uso.')).toBeInTheDocument();
  });

  it('el campo password tiene placeholder en modo edición', () => {
    renderForm({ mode: 'edit' });
    expect(screen.getByLabelText(/contraseña/i)).toHaveAttribute(
      'placeholder',
      'Dejar en blanco para no cambiar'
    );
  });
});

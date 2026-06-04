import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('renderiza un input', () => {
    render(<Input aria-label="nombre" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('acepta y muestra el valor', async () => {
    render(<Input aria-label="nombre" />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'hola');
    expect(input).toHaveValue('hola');
  });

  it('aplica aria-invalid y clase error con hasError', () => {
    render(<Input aria-label="nombre" hasError />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.className).toMatch(/error/);
  });

  it('queda deshabilitado con disabled', () => {
    render(<Input aria-label="nombre" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});

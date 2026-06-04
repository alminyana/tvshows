import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renderiza un textarea', () => {
    render(<Textarea aria-label="descripción" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('acepta y muestra el valor', async () => {
    render(<Textarea aria-label="descripción" />);
    await userEvent.type(screen.getByRole('textbox'), 'texto');
    expect(screen.getByRole('textbox')).toHaveValue('texto');
  });

  it('aplica aria-invalid y clase error con hasError', () => {
    render(<Textarea aria-label="descripción" hasError />);
    const ta = screen.getByRole('textbox');
    expect(ta).toHaveAttribute('aria-invalid', 'true');
    expect(ta.className).toMatch(/error/);
  });
});

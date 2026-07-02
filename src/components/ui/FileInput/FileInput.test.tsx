import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileInput } from './FileInput';

describe('FileInput', () => {
  it('triggers the hidden file input when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<FileInput onChange={vi.fn()} ariaLabel="Portada" buttonLabel="Seleccionar imagen" />);

    const input = screen.getByLabelText('Portada') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    await user.click(screen.getByRole('button', { name: 'Seleccionar imagen' }));

    expect(clickSpy).toHaveBeenCalled();
  });

  it('calls onChange when a file is selected', () => {
    const onChange = vi.fn();
    render(<FileInput onChange={onChange} ariaLabel="Portada" buttonLabel="Seleccionar imagen" />);

    const input = screen.getByLabelText('Portada');
    const file = new File(['img'], 'foto.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });

    expect(onChange).toHaveBeenCalled();
  });

  it('shows the selected file name when provided', () => {
    render(
      <FileInput onChange={vi.fn()} ariaLabel="Portada" buttonLabel="Seleccionar imagen" fileName="foto.png" />,
    );

    expect(screen.getByText('foto.png')).toBeInTheDocument();
  });
});

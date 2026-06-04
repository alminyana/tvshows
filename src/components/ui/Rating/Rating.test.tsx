import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Rating } from './Rating';

describe('Rating — modo lectura', () => {
  it('muestra el aria-label con el valor', () => {
    render(<Rating value={3} readOnly />);
    expect(screen.getByLabelText(/valoración: 3 de 5/i)).toBeInTheDocument();
  });
});

describe('Rating — modo input', () => {
  it('renderiza 5 radios', () => {
    render(<Rating value={0} onChange={() => undefined} />);
    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });

  it('marca el radio correspondiente al valor', () => {
    render(<Rating value={3} onChange={() => undefined} />);
    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(radios[2].checked).toBe(true);
  });

  it('llama onChange al seleccionar una estrella', async () => {
    const onChange = vi.fn();
    render(<Rating value={0} onChange={onChange} />);
    await userEvent.click(screen.getAllByRole('radio')[1]);
    expect(onChange).toHaveBeenCalledWith(2);
  });
});

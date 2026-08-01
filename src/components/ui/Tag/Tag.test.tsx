import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tag } from './Tag';

describe('Tag', () => {
  it('muestra el label', () => {
    render(<Tag label="Drama" />);
    expect(screen.getByText('Drama')).toBeInTheDocument();
  });

  it('no muestra botón de quitar si no se pasa onRemove', () => {
    render(<Tag label="Drama" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('aplica el modificador de texto enfatizado con strongText', () => {
    render(<Tag label="Drama" strongText />);
    expect(screen.getByText('Drama').className).toMatch(/strongText/);
  });

  it('llama onRemove al pulsar el botón de quitar', async () => {
    const onRemove = vi.fn();
    render(<Tag label="Drama" onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button', { name: /quitar drama/i }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});

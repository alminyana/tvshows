import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('usa el label como aria-label', () => {
    render(<IconButton icon="✏️" label="Editar" />);
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
  });

  it('llama onClick al pulsar', async () => {
    const onClick = vi.fn();
    render(<IconButton icon="✏️" label="Editar" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('queda deshabilitado', async () => {
    const onClick = vi.fn();
    render(<IconButton icon="✏️" label="Editar" disabled onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});

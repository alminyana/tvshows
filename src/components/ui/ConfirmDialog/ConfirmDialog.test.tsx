import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';

function renderDialog({
  isOpen = true,
  onClose = vi.fn(),
  onConfirm = vi.fn(),
} = {}) {
  return render(
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="¿Eliminar serie?"
      message="Esta acción no se puede deshacer."
    />,
  );
}

describe('ConfirmDialog', () => {
  it('no renderiza si isOpen es false', () => {
    renderDialog({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('muestra el título y el mensaje', () => {
    renderDialog();
    expect(screen.getByText('¿Eliminar serie?')).toBeInTheDocument();
    expect(screen.getByText('Esta acción no se puede deshacer.')).toBeInTheDocument();
  });

  it('llama onConfirm al pulsar Confirmar', async () => {
    const onConfirm = vi.fn();
    renderDialog({ onConfirm });
    await userEvent.click(screen.getByRole('button', { name: /confirmar/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('llama onClose al pulsar Cancelar', async () => {
    const onClose = vi.fn();
    renderDialog({ onClose });
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

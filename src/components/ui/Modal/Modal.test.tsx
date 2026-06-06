import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

function renderModal(isOpen: boolean, onClose = vi.fn()) {
  return render(
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar">
      <p>Contenido del modal</p>
    </Modal>,
  );
}

describe('Modal', () => {
  it('no renderiza nada si isOpen es false', () => {
    renderModal(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza el dialog con el título cuando isOpen es true', () => {
    renderModal(true);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirmar')).toBeInTheDocument();
    expect(screen.getByText('Contenido del modal')).toBeInTheDocument();
  });

  it('llama onClose al pulsar el botón cerrar', async () => {
    const onClose = vi.fn();
    renderModal(true, onClose);
    await userEvent.click(screen.getByRole('button', { name: /cerrar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('llama onClose al presionar Escape', async () => {
    const onClose = vi.fn();
    renderModal(true, onClose);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('llama onClose al pulsar el overlay', async () => {
    const onClose = vi.fn();
    renderModal(true, onClose);
    await userEvent.click(document.querySelector('._overlay_') ?? screen.getByRole('dialog').parentElement!);
    expect(onClose).toHaveBeenCalled();
  });

  it('atrapa el foco al hacer Tab desde el último elemento', async () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Trap">
        <button>Primero</button>
        <button>Último</button>
      </Modal>,
    );
    const buttons = screen.getAllByRole('button');
    const lastFocusable = buttons[buttons.length - 1];
    lastFocusable.focus();
    await userEvent.tab();
    // El foco vuelve al primer elemento focusable del modal
    expect(document.activeElement).toBe(buttons[0]);
  });
});

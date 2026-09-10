import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelpPopover } from './HelpPopover';

function renderPopover() {
  return render(
    <HelpPopover label="los géneros">
      <p>Elige del catálogo o escribe uno nuevo.</p>
    </HelpPopover>,
  );
}

describe('HelpPopover', () => {
  it('empieza cerrado', () => {
    renderPopover();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ayuda sobre los géneros/i }))
      .toHaveAttribute('aria-expanded', 'false');
  });

  it('abre el panel al pulsar el botón', async () => {
    renderPopover();
    await userEvent.click(screen.getByRole('button', { name: /ayuda sobre los géneros/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/elige del catálogo/i)).toBeInTheDocument();
  });

  it('marca aria-expanded mientras está abierto', async () => {
    renderPopover();
    const trigger = screen.getByRole('button', { name: /ayuda sobre los géneros/i });
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('cierra al volver a pulsar el botón', async () => {
    renderPopover();
    const trigger = screen.getByRole('button', { name: /ayuda sobre los géneros/i });
    await userEvent.click(trigger);
    await userEvent.click(trigger);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('cierra con el botón de cerrar', async () => {
    renderPopover();
    await userEvent.click(screen.getByRole('button', { name: /ayuda sobre los géneros/i }));
    await userEvent.click(screen.getByRole('button', { name: /cerrar/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('cierra con Escape y devuelve el foco al botón', async () => {
    renderPopover();
    const trigger = screen.getByRole('button', { name: /ayuda sobre los géneros/i });
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('cierra al pulsar fuera', async () => {
    render(
      <div>
        <HelpPopover label="los géneros">
          <p>Elige del catálogo o escribe uno nuevo.</p>
        </HelpPopover>
        <button type="button">Fuera</button>
      </div>,
    );
    await userEvent.click(screen.getByRole('button', { name: /ayuda sobre los géneros/i }));
    await userEvent.click(screen.getByRole('button', { name: /fuera/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('el control puede referenciar el panel con aria-describedby', async () => {
    render(
      <HelpPopover label="los géneros" id="genres-help">
        <p>Elige del catálogo o escribe uno nuevo.</p>
      </HelpPopover>,
    );
    await userEvent.click(screen.getByRole('button', { name: /ayuda sobre los géneros/i }));
    expect(screen.getByRole('dialog')).toHaveAttribute('id', 'genres-help');
  });
});

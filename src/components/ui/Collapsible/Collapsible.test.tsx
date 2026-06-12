import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Collapsible } from './Collapsible';

function renderCollapsible(activeCount = 0) {
  return render(
    <Collapsible header="Filtros" activeCount={activeCount}>
      <input placeholder="campo" />
    </Collapsible>,
  );
}

describe('Collapsible', () => {
  it('empieza colapsado con aria-expanded false', () => {
    renderCollapsible();
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('se abre al hacer click', async () => {
    renderCollapsible();
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  it('se cierra al hacer click de nuevo', async () => {
    renderCollapsible();
    const btn = screen.getByRole('button');
    await userEvent.click(btn);
    await userEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('se abre con tecla Enter', async () => {
    renderCollapsible();
    const btn = screen.getByRole('button');
    btn.focus();
    await userEvent.keyboard('{Enter}');
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('se abre con tecla Space', async () => {
    renderCollapsible();
    const btn = screen.getByRole('button');
    btn.focus();
    await userEvent.keyboard(' ');
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('muestra el header sin contador cuando activeCount es 0', () => {
    renderCollapsible(0);
    expect(screen.getByRole('button')).toHaveTextContent('Filtros');
  });

  it('muestra el contador cuando activeCount > 0', () => {
    renderCollapsible(2);
    expect(screen.getByRole('button')).toHaveTextContent('Filtros (2)');
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { NotificationProvider } from './NotificationContext';
import { use } from 'react';
import { NotificationContext } from './notificationContextInstance';

function NotifyButton({ msg }: { msg: string }) {
  const { notify } = use(NotificationContext);
  return <button onClick={() => notify(msg)}>Notify</button>;
}

function setup(msg = 'Operación correcta') {
  return render(
    <NotificationProvider>
      <NotifyButton msg={msg} />
    </NotificationProvider>,
  );
}

describe('NotificationContext', () => {
  it('no muestra banner inicialmente', () => {
    setup();
    const banner = screen.getByRole('status');
    expect(banner).toBeEmptyDOMElement();
  });

  it('muestra el mensaje al llamar notify', () => {
    setup('Serie creada correctamente.');
    fireEvent.click(screen.getByRole('button', { name: 'Notify' }));
    expect(screen.getByRole('status')).toHaveTextContent('Serie creada correctamente.');
  });

  it('el banner tiene aria-live polite', () => {
    setup();
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('oculta el mensaje después del timeout', () => {
    vi.useFakeTimers();
    setup('Mensaje temporal');
    fireEvent.click(screen.getByRole('button', { name: 'Notify' }));
    expect(screen.getByRole('status')).toHaveTextContent('Mensaje temporal');
    act(() => { vi.advanceTimersByTime(4100); });
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    vi.useRealTimers();
  });
});

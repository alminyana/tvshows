import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotFoundPage } from './NotFoundPage';

function renderPage() {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <NotFoundPage />
    </MemoryRouter>,
  );
}

describe('NotFoundPage', () => {
  it('muestra el código 404', () => {
    renderPage();
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('muestra el título de página no encontrada', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /página no encontrada/i })).toBeInTheDocument();
  });

  it('muestra el detalle descriptivo', () => {
    renderPage();
    expect(screen.getByText(/la url que has introducido no existe/i)).toBeInTheDocument();
  });

  it('tiene un botón para ir al inicio', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /ir al inicio/i })).toBeInTheDocument();
  });
});

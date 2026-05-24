import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

function renderApp(initialPath = '/series') {
  return render(
    <MemoryRouter
      initialEntries={[initialPath]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>,
  );
}

describe('App', () => {
  it('renderiza el layout sin explotar', () => {
    renderApp();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('ruta /series renderiza el placeholder de series', () => {
    renderApp('/series');
    expect(screen.getByText(/series.*próximamente/i)).toBeInTheDocument();
  });

  it('ruta desconocida renderiza el placeholder 404', () => {
    renderApp('/ruta-inexistente');
    expect(screen.getByText(/404/i)).toBeInTheDocument();
  });
});

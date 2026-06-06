import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import App from './App';

vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    useSeries: () => ({ series: [], loading: false, error: null, reload: vi.fn() }),
    useSeriesById: () => ({ series: null, loading: false, notFound: true, error: null }),
    useAuth: () => ({ user: null, loading: false, login: vi.fn(), logout: vi.fn() }),
  };
});

vi.mock('@/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services')>();
  return {
    ...actual,
    authService: {
      getCurrentUser: vi.fn().mockResolvedValue(null),
      login: vi.fn(),
      logout: vi.fn(),
    },
  };
});

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
  it('renderiza el layout sin explotar', async () => {
    renderApp();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('ruta /series renderiza el listado', async () => {
    renderApp('/series');
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/buscar por título/i)).toBeInTheDocument();
    });
  });

  it('ruta desconocida renderiza la página 404', () => {
    renderApp('/ruta-inexistente');
    expect(screen.getByRole('heading', { name: /página no encontrada/i })).toBeInTheDocument();
  });
});

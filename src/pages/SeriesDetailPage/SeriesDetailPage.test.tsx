import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SeriesDetailPage } from './SeriesDetailPage';
import type { Series } from '@/types';

vi.mock('@/hooks', () => ({
  useSeriesById: vi.fn(),
  useSeries: vi.fn(),
  useTheme: vi.fn(() => ({ theme: 'default', mode: 'light', setTheme: vi.fn(), setMode: vi.fn(), toggleMode: vi.fn() })),
  useAuth: vi.fn(() => ({ user: null, loading: false, login: vi.fn(), logout: vi.fn() })),
  useNotification: vi.fn(() => ({ notify: vi.fn() })),
}));

vi.mock('@/services', () => ({
  imageService: { get: vi.fn().mockResolvedValue(undefined), remove: vi.fn().mockResolvedValue(undefined) },
  seriesService: { remove: vi.fn().mockResolvedValue(undefined) },
}));

import { useSeriesById, useAuth } from '@/hooks';
import { seriesService, imageService } from '@/services';

const mockSeries: Series = {
  id: 'abc-1',
  title: 'Breaking Bad',
  synopsis: 'Un profesor de química.',
  seasons: '5 temporadas',
  cast: ['Bryan Cranston', 'Aaron Paul'],
  year: 2008,
  rating: 5,
  genres: ['Drama', 'Thriller'],
  coverImage: 'img-1',
  opinion: 'Magistral.',
  createdBy: 'user-1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

function renderPage(id = 'abc-1') {
  return render(
    <MemoryRouter initialEntries={[`/series/${id}`]}>
      <Routes>
        <Route path="/series/:id" element={<SeriesDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SeriesDetailPage', () => {
  it('muestra spinner mientras carga', () => {
    vi.mocked(useSeriesById).mockReturnValue({ series: null, loading: true, notFound: false, error: null });
    renderPage();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('muestra mensaje de no encontrado', () => {
    vi.mocked(useSeriesById).mockReturnValue({ series: null, loading: false, notFound: true, error: null });
    renderPage('no-existe');
    expect(screen.getByText(/no encontrado/i)).toBeInTheDocument();
  });

  it('renderiza los datos completos de la serie', () => {
    vi.mocked(useSeriesById).mockReturnValue({ series: mockSeries, loading: false, notFound: false, error: null });
    renderPage();
    expect(screen.getByRole('heading', { name: 'Breaking Bad' })).toBeInTheDocument();
    expect(screen.getByText('2008')).toBeInTheDocument();
    expect(screen.getByText('5 temporadas')).toBeInTheDocument();
    expect(screen.getByText('Un profesor de química.')).toBeInTheDocument();
    expect(screen.getByText('Bryan Cranston')).toBeInTheDocument();
    expect(screen.getByText('Aaron Paul')).toBeInTheDocument();
    expect(screen.getByText('Drama')).toBeInTheDocument();
    expect(screen.getByText('Thriller')).toBeInTheDocument();
    expect(screen.getByText('Magistral.')).toBeInTheDocument();
  });

  it('no muestra la sección opinión si está vacía', () => {
    const withoutOpinion = { ...mockSeries, opinion: undefined };
    vi.mocked(useSeriesById).mockReturnValue({ series: withoutOpinion, loading: false, notFound: false, error: null });
    renderPage();
    expect(screen.queryByText('Mi opinión')).not.toBeInTheDocument();
  });

  it('muestra el texto de temporadas tal cual', () => {
    vi.mocked(useSeriesById).mockReturnValue({
      series: { ...mockSeries, seasons: 'Miniserie de 1 sola temporada' },
      loading: false,
      notFound: false,
      error: null,
    });
    renderPage();
    expect(screen.getByText('Miniserie de 1 sola temporada')).toBeInTheDocument();
  });

  it('no muestra botones de editar/eliminar si no hay sesión', () => {
    vi.mocked(useSeriesById).mockReturnValue({ series: mockSeries, loading: false, notFound: false, error: null });
    renderPage();
    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument();
  });

  it('muestra botones de editar/eliminar al Admin', () => {
    vi.mocked(useSeriesById).mockReturnValue({ series: mockSeries, loading: false, notFound: false, error: null });
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'admin-1', email: 'a@local', password: 'h', role: 'admin', createdAt: '' },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
    renderPage();
    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument();
  });

  it('muestra botones de editar/eliminar al User dueño de la serie', () => {
    vi.mocked(useSeriesById).mockReturnValue({ series: mockSeries, loading: false, notFound: false, error: null });
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1', email: 'u@local', password: 'h', role: 'user', createdAt: '' },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
    renderPage();
    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument();
  });

  it('oculta botones de editar/eliminar a un User que no es el dueño', () => {
    vi.mocked(useSeriesById).mockReturnValue({ series: mockSeries, loading: false, notFound: false, error: null });
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'otro-user', email: 'o@local', password: 'h', role: 'user', createdAt: '' },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
    renderPage();
    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument();
  });

  it('abre el diálogo de confirmación al pulsar eliminar', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    vi.mocked(useSeriesById).mockReturnValue({ series: mockSeries, loading: false, notFound: false, error: null });
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'admin-1', email: 'a@local', password: 'h', role: 'admin', createdAt: '' },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
    renderPage();
    await user.click(screen.getByRole('button', { name: /eliminar/i }));
    expect(screen.getByText(/eliminar esta serie/i)).toBeInTheDocument();
  });

  it('llama a seriesService.remove y navega a /series al confirmar', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    vi.mocked(useSeriesById).mockReturnValue({ series: mockSeries, loading: false, notFound: false, error: null });
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'admin-1', email: 'a@local', password: 'h', role: 'admin', createdAt: '' },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/series/abc-1']}>
        <Routes>
          <Route path="/series/:id" element={<SeriesDetailPage />} />
          <Route path="/series" element={<p>Listado</p>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /eliminar/i }));
    await user.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() => {
      expect(vi.mocked(seriesService.remove)).toHaveBeenCalledWith('abc-1');
      expect(vi.mocked(imageService.remove)).toHaveBeenCalledWith('img-1');
    });
    await waitFor(() => {
      expect(screen.getByText('Listado')).toBeInTheDocument();
    });
  });
});

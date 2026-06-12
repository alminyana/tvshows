import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SeriesListPage } from './SeriesListPage';
import type { Series } from '@/types';

vi.mock('@/hooks', () => ({
  useSeries: vi.fn(),
  useSeriesById: vi.fn(),
  useTheme: vi.fn(() => ({ theme: 'default', mode: 'light', setTheme: vi.fn(), setMode: vi.fn(), toggleMode: vi.fn() })),
  useAuth: vi.fn(() => ({ user: null, loading: false, login: vi.fn(), logout: vi.fn() })),
  useSeriesViewMode: vi.fn(() => ['cards', vi.fn()]),
}));

vi.mock('@/components/features', () => ({
  SeriesCard: ({ series }: { series: Series }) => <div data-testid="series-card">{series.title}</div>,
  SeriesRow: ({ series }: { series: Series }) => <div data-testid="series-row">{series.title}</div>,
}));

import { useSeries, useAuth, useSeriesViewMode } from '@/hooks';

const makeSeries = (overrides: Partial<Series> = {}): Series => ({
  id: 'id-1',
  title: 'Breaking Bad',
  synopsis: 'Sinopsis',
  seasons: '5 temporadas',
  cast: [],
  year: 2008,
  rating: 5,
  genres: ['Drama'],
  coverImage: 'img-1',
  createdBy: 'user-1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

function renderPage(initialSearch = '') {
  return render(
    <MemoryRouter initialEntries={[`/series${initialSearch}`]}>
      <Routes>
        <Route path="/series" element={<SeriesListPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useSeriesViewMode).mockReturnValue(['cards', vi.fn()]);
});

describe('SeriesListPage', () => {
  it('muestra spinner mientras carga', () => {
    vi.mocked(useSeries).mockReturnValue({ series: [], loading: true, error: null, reload: vi.fn() });
    renderPage();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('muestra mensaje cuando no hay resultados', () => {
    vi.mocked(useSeries).mockReturnValue({ series: [], loading: false, error: null, reload: vi.fn() });
    renderPage();
    expect(screen.getByText(/no se encontraron/i)).toBeInTheDocument();
  });

  it('renderiza las series en modo cards', () => {
    vi.mocked(useSeries).mockReturnValue({
      series: [makeSeries(), makeSeries({ id: 'id-2', title: 'Severance' })],
      loading: false,
      error: null,
      reload: vi.fn(),
    });
    renderPage();
    expect(screen.getAllByTestId('series-card')).toHaveLength(2);
  });

  it('renderiza las series en modo list', () => {
    vi.mocked(useSeriesViewMode).mockReturnValue(['list', vi.fn()]);
    vi.mocked(useSeries).mockReturnValue({
      series: [makeSeries(), makeSeries({ id: 'id-2', title: 'Severance' })],
      loading: false,
      error: null,
      reload: vi.fn(),
    });
    renderPage();
    expect(screen.getAllByTestId('series-row')).toHaveLength(2);
  });

  it('filtra por título al escribir en el buscador', async () => {
    vi.mocked(useSeries).mockReturnValue({
      series: [makeSeries(), makeSeries({ id: 'id-2', title: 'Severance' })],
      loading: false,
      error: null,
      reload: vi.fn(),
    });
    renderPage();
    const input = screen.getByPlaceholderText(/buscar por título/i);
    fireEvent.change(input, { target: { value: 'Sever' } });
    await waitFor(() => {
      expect(screen.getByText('Severance')).toBeInTheDocument();
      expect(screen.queryByText('Breaking Bad')).not.toBeInTheDocument();
    });
  });

  it('filtra por género', async () => {
    vi.mocked(useSeries).mockReturnValue({
      series: [
        makeSeries({ genres: ['Drama'] }),
        makeSeries({ id: 'id-2', title: 'Severance', genres: ['Ciencia ficción'] }),
      ],
      loading: false,
      error: null,
      reload: vi.fn(),
    });
    renderPage();
    const genreSelect = screen.getByLabelText(/filtrar por género/i);
    fireEvent.change(genreSelect, { target: { value: 'Drama' } });
    await waitFor(() => {
      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
      expect(screen.queryByText('Severance')).not.toBeInTheDocument();
    });
  });

  it('filtra por valoración', async () => {
    vi.mocked(useSeries).mockReturnValue({
      series: [
        makeSeries({ rating: 5 }),
        makeSeries({ id: 'id-2', title: 'Severance', rating: 3 }),
      ],
      loading: false,
      error: null,
      reload: vi.fn(),
    });
    renderPage();
    const ratingSelect = screen.getByLabelText(/filtrar por valoración/i);
    fireEvent.change(ratingSelect, { target: { value: '4' } });
    await waitFor(() => {
      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
      expect(screen.queryByText('Severance')).not.toBeInTheDocument();
    });
  });

  it('muestra error si el hook falla', () => {
    vi.mocked(useSeries).mockReturnValue({ series: [], loading: false, error: 'Error', reload: vi.fn() });
    renderPage();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('no muestra el botón "Nueva serie" cuando no hay sesión', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, login: vi.fn(), logout: vi.fn() });
    vi.mocked(useSeries).mockReturnValue({ series: [], loading: false, error: null, reload: vi.fn() });
    renderPage();
    expect(screen.queryByRole('button', { name: /nueva serie/i })).not.toBeInTheDocument();
  });

  it('muestra el botón "Nueva serie" cuando hay sesión', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'u1', email: 'user@test.com', password: 'h', role: 'user', createdAt: '' },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
    vi.mocked(useSeries).mockReturnValue({ series: [], loading: false, error: null, reload: vi.fn() });
    renderPage();
    expect(screen.getByRole('button', { name: /nueva serie/i })).toBeInTheDocument();
  });

  it('el toggle de vista cambia entre cards y lista', async () => {
    const setViewMode = vi.fn();
    vi.mocked(useSeriesViewMode).mockReturnValue(['cards', setViewMode]);
    vi.mocked(useSeries).mockReturnValue({ series: [], loading: false, error: null, reload: vi.fn() });
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /vista en lista/i }));
    expect(setViewMode).toHaveBeenCalledWith('list');
  });
});

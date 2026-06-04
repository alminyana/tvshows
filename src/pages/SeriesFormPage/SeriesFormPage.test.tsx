import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SeriesFormPage } from './SeriesFormPage';
import type { Series } from '@/types';

vi.mock('@/hooks', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user-1', email: 'u@local', password: 'h', role: 'user', createdAt: '' },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  })),
  useSeriesById: vi.fn(() => ({ series: null, loading: false, notFound: false, error: null })),
  useTheme: vi.fn(() => ({ theme: 'default', mode: 'light' })),
  useSeries: vi.fn(() => ({ series: [], loading: false, reload: vi.fn() })),
}));

vi.mock('@/services', () => ({
  seriesService: {
    create: vi.fn().mockResolvedValue({ id: 'new-1' }),
    update: vi.fn().mockResolvedValue({}),
    remove: vi.fn().mockResolvedValue(undefined),
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue(undefined),
  },
  imageService: {
    save: vi.fn().mockResolvedValue('img-new'),
    get: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  },
  authService: { getCurrentUser: vi.fn().mockResolvedValue(null) },
  usersService: { getAll: vi.fn().mockResolvedValue([]) },
}));

vi.mock('@/components/features', () => ({
  SeriesForm: vi.fn(({ onSubmit }: { onSubmit: (d: unknown, f?: File) => Promise<void> }) => (
    <button
      type="button"
      onClick={() =>
        onSubmit(
          {
            title: 'Test',
            synopsis: 'Synopsis',
            seasons: 1,
            year: 2020,
            rating: 3,
            genres: ['Drama'],
            cast: [],
          },
          new File(['img'], 'cover.jpg', { type: 'image/jpeg' }),
        )
      }
    >
      Enviar formulario
    </button>
  )),
}));

import { useSeriesById, useAuth } from '@/hooks';
import { seriesService, imageService } from '@/services';

const mockSeries: Series = {
  id: 'abc-1',
  title: 'Breaking Bad',
  synopsis: 'Sinopsis',
  seasons: 5,
  cast: ['Bryan Cranston'],
  year: 2008,
  rating: 5,
  genres: ['Drama'],
  coverImage: 'img-1',
  createdBy: 'user-1',
  createdAt: '',
  updatedAt: '',
};

function renderCreate() {
  return render(
    <MemoryRouter
      initialEntries={['/series/new']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/series/new" element={<SeriesFormPage />} />
        <Route path="/series/:id" element={<p>Detalle</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderEdit(id = 'abc-1') {
  return render(
    <MemoryRouter
      initialEntries={[`/series/${id}/edit`]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/series/:id/edit" element={<SeriesFormPage />} />
        <Route path="/series/:id" element={<p>Detalle</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAuth).mockReturnValue({
    user: { id: 'user-1', email: 'u@local', password: 'h', role: 'user', createdAt: '' },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  });
  vi.mocked(useSeriesById).mockReturnValue({ series: null, loading: false, notFound: false, error: null });
});

describe('SeriesFormPage — modo crear', () => {
  it('muestra título "Nueva serie"', () => {
    renderCreate();
    expect(screen.getByRole('heading', { name: /nueva serie/i })).toBeInTheDocument();
  });

  it('llama a seriesService.create y navega al detalle al enviar', async () => {
    const user = userEvent.setup();
    renderCreate();
    await user.click(screen.getByRole('button', { name: /enviar formulario/i }));
    await waitFor(() => {
      expect(vi.mocked(imageService.save)).toHaveBeenCalledOnce();
      expect(vi.mocked(seriesService.create)).toHaveBeenCalledOnce();
    });
    await waitFor(() => {
      expect(screen.getByText('Detalle')).toBeInTheDocument();
    });
  });
});

describe('SeriesFormPage — modo editar', () => {
  it('muestra spinner mientras carga', () => {
    vi.mocked(useSeriesById).mockReturnValue({ series: null, loading: true, notFound: false, error: null });
    renderEdit();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('muestra error si la serie no existe', () => {
    vi.mocked(useSeriesById).mockReturnValue({ series: null, loading: false, notFound: true, error: null });
    renderEdit('no-existe');
    expect(screen.getByText(/no encontrado/i)).toBeInTheDocument();
  });

  it('muestra título "Editar serie"', () => {
    vi.mocked(useSeriesById).mockReturnValue({ series: mockSeries, loading: false, notFound: false, error: null });
    renderEdit();
    expect(screen.getByRole('heading', { name: /editar serie/i })).toBeInTheDocument();
  });

  it('muestra error si el user no tiene permiso para editar', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'otro-user', email: 'o@local', password: 'h', role: 'user', createdAt: '' },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
    vi.mocked(useSeriesById).mockReturnValue({ series: mockSeries, loading: false, notFound: false, error: null });
    renderEdit();
    expect(screen.getByText(/ha ocurrido un error/i)).toBeInTheDocument();
  });

  it('llama a seriesService.update sin nueva imagen', async () => {
    const user = userEvent.setup();
    vi.mocked(useSeriesById).mockReturnValue({ series: mockSeries, loading: false, notFound: false, error: null });
    renderEdit();
    await user.click(screen.getByRole('button', { name: /enviar formulario/i }));
    await waitFor(() => {
      expect(vi.mocked(seriesService.update)).toHaveBeenCalledOnce();
    });
  });

  it('reemplaza imagen al editar si se sube una nueva', async () => {
    const user = userEvent.setup();
    vi.mocked(useSeriesById).mockReturnValue({ series: mockSeries, loading: false, notFound: false, error: null });
    renderEdit();
    await user.click(screen.getByRole('button', { name: /enviar formulario/i }));
    await waitFor(() => {
      expect(vi.mocked(imageService.remove)).toHaveBeenCalledWith('img-1');
      expect(vi.mocked(imageService.save)).toHaveBeenCalledOnce();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './LandingPage';
import type { DashboardMetrics } from '@/hooks';
import type { Series } from '@/types';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/hooks', () => ({
  useDashboardMetrics: vi.fn(),
}));

vi.mock('@/services', () => ({
  imageService: { getUrl: (path: string) => `https://cdn.test/${path}` },
}));

import { useDashboardMetrics } from '@/hooks';

const makeSeries = (overrides: Partial<Series> = {}): Series => ({
  id: 'id-1',
  title: 'Breaking Bad',
  synopsis: 'Sinopsis',
  seasons: '5 temporadas',
  cast: [],
  year: 2008,
  rating: 5,
  genres: ['Drama'],
  coverImage: 'cover-1.jpg',
  createdBy: 'user-1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

const SERIES: Series[] = [
  makeSeries({ id: '1', title: 'Breaking Bad', year: 2008 }),
  makeSeries({ id: '2', title: 'Fariña', year: 2018, coverImage: 'cover-2.jpg' }),
  makeSeries({ id: '3', title: 'Sin portada', year: 2024, coverImage: '' }),
];

const METRICS: DashboardMetrics = {
  series: SERIES,
  totalSeries: 132,
  featuredSeries: 68,
  miniseriesCount: 66,
  singleSeasonCount: 11,
  multiSeasonCount: 55,
  genreDistribution: [
    { genre: 'Drama', count: 70 },
    { genre: 'Thriller', count: 68 },
  ],
  ratingDistribution: [{ rating: 5, count: 15 }],
  durationDistribution: [{ type: 'multi', count: 55 }],
  loading: false,
  error: null,
};

function mockMetrics(overrides: Partial<DashboardMetrics> = {}) {
  vi.mocked(useDashboardMetrics).mockReturnValue({ ...METRICS, ...overrides });
}

function renderLanding() {
  return render(
    <MemoryRouter
      initialEntries={['/']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/series" element={<p>Series</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockMetrics();
});

describe('LandingPage', () => {
  it('muestra el título y el claim', () => {
    renderLanding();
    expect(screen.getByRole('heading', { name: /^tv shows$/i })).toBeInTheDocument();
    expect(screen.getByText(/tu colección personal/i)).toBeInTheDocument();
  });

  it('muestra el botón "Acceder"', () => {
    renderLanding();
    expect(screen.getAllByRole('button', { name: /acceder/i }).length).toBeGreaterThan(0);
  });

  it('navega a /series al pulsar "Acceder"', async () => {
    renderLanding();
    await userEvent.click(screen.getAllByRole('button', { name: /acceder/i })[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/series');
  });

  it('navega a /dashboard al pulsar "Ver el dashboard"', async () => {
    renderLanding();
    await userEvent.click(screen.getByRole('button', { name: /ver el dashboard/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('repite el CTA "Acceder" en la banda de acceso', () => {
    renderLanding();
    expect(screen.getAllByRole('button', { name: /acceder/i })).toHaveLength(2);
    expect(screen.getByRole('heading', { name: /entra sin cuenta/i })).toBeInTheDocument();
  });

  it('muestra el rango de años y el total de series en el hero', () => {
    renderLanding();
    expect(screen.getByText(/2008–2024/)).toBeInTheDocument();
    expect(screen.getByText(/132 series vistas/)).toBeInTheDocument();
  });

  it('muestra las cifras de la colección', () => {
    renderLanding();
    const stats = screen
      .getByRole('heading', { name: /la colección en cifras/i })
      .closest('section') as HTMLElement;
    expect(within(stats).getByText('132')).toBeInTheDocument();
    expect(within(stats).getByText('68')).toBeInTheDocument();
    expect(within(stats).getByText('66')).toBeInTheDocument();
    expect(within(stats).getByText('55')).toBeInTheDocument();
  });

  it('pinta la tira solo con las series que tienen portada', () => {
    renderLanding();
    expect(screen.getByRole('img', { name: 'Breaking Bad' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Fariña' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Sin portada' })).not.toBeInTheDocument();
  });

  it('lista los géneros más frecuentes en la mini gráfica', () => {
    renderLanding();
    const chart = screen.getByText(/series por género/i).parentElement as HTMLElement;
    expect(within(chart).getByText('Drama')).toBeInTheDocument();
    expect(within(chart).getByText('70')).toBeInTheDocument();
    expect(within(chart).getByText('Thriller')).toBeInTheDocument();
  });

  it('omite las cifras y la tira mientras cargan los datos', () => {
    mockMetrics({ series: [], totalSeries: 0, loading: true });
    renderLanding();
    expect(screen.queryByRole('heading', { name: /la colección en cifras/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /un vistazo a la colección/i })).not.toBeInTheDocument();
    // El hero y la banda de acceso se pintan igual, sin esperar a Supabase.
    expect(screen.getByRole('heading', { name: /^tv shows$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /entra sin cuenta/i })).toBeInTheDocument();
  });
});

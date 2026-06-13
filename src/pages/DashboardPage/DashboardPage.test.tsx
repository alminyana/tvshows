import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardPage } from './DashboardPage';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => null,
  Cell: () => null,
  Legend: () => null,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
}));

const mockUseDashboardMetrics = vi.hoisted(() => vi.fn());

vi.mock('@/hooks', () => ({
  useDashboardMetrics: mockUseDashboardMetrics,
}));

const DEFAULT_METRICS = {
  totalSeries: 10,
  featuredSeries: 4,
  genreDistribution: [
    { genre: 'Drama' as const, count: 5 },
    { genre: 'Thriller' as const, count: 3 },
  ],
  ratingDistribution: [
    { rating: 1, count: 0 },
    { rating: 2, count: 1 },
    { rating: 3, count: 2 },
    { rating: 4, count: 3 },
    { rating: 5, count: 4 },
  ],
  loading: false,
  error: null,
};

describe('DashboardPage', () => {
  beforeEach(() => {
    mockUseDashboardMetrics.mockReturnValue(DEFAULT_METRICS);
  });

  it('muestra el título del dashboard', () => {
    render(<DashboardPage />);
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('muestra los valores KPI correctos', () => {
    render(<DashboardPage />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('muestra los labels de las KPI cards', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/total de series/i)).toBeInTheDocument();
    expect(screen.getByText(/series destacadas/i)).toBeInTheDocument();
  });

  it('muestra los gráficos de barras y el quesito', () => {
    render(<DashboardPage />);
    expect(screen.getAllByTestId('bar-chart')).toHaveLength(2);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('muestra spinner mientras carga', () => {
    mockUseDashboardMetrics.mockReturnValue({ ...DEFAULT_METRICS, loading: true });
    render(<DashboardPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('muestra el error si falla la carga', () => {
    mockUseDashboardMetrics.mockReturnValue({
      ...DEFAULT_METRICS,
      loading: false,
      error: 'Error al cargar las series',
    });
    render(<DashboardPage />);
    expect(screen.getByText('Error al cargar las series')).toBeInTheDocument();
  });
});

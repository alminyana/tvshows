import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GenreDistributionChart } from './GenreDistributionChart';
import type { GenreCount } from '@/hooks/useDashboardMetrics';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
}));

const DATA: GenreCount[] = [
  { genre: 'Drama', count: 5 },
  { genre: 'Thriller', count: 3 },
];

describe('GenreDistributionChart', () => {
  it('renderiza el título del gráfico', () => {
    render(<GenreDistributionChart data={DATA} />);
    expect(screen.getByText(/distribución por género/i)).toBeInTheDocument();
  });

  it('renderiza el gráfico de barras', () => {
    render(<GenreDistributionChart data={DATA} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('no falla con datos vacíos', () => {
    render(<GenreDistributionChart data={[]} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });
});

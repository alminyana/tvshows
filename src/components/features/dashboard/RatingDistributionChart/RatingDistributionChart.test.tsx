import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RatingDistributionChart } from './RatingDistributionChart';
import type { RatingCount } from '@/hooks/useDashboardMetrics';

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

const DATA: RatingCount[] = [
  { rating: 1, count: 0 },
  { rating: 2, count: 1 },
  { rating: 3, count: 2 },
  { rating: 4, count: 3 },
  { rating: 5, count: 4 },
];

describe('RatingDistributionChart', () => {
  it('renderiza el título del gráfico', () => {
    render(<RatingDistributionChart data={DATA} />);
    expect(screen.getByText(/distribución por valoración/i)).toBeInTheDocument();
  });

  it('renderiza el gráfico de barras', () => {
    render(<RatingDistributionChart data={DATA} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('no falla con datos vacíos', () => {
    render(<RatingDistributionChart data={[]} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });
});

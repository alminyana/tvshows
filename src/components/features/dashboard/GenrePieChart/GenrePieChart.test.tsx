import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GenrePieChart } from './GenrePieChart';
import type { GenreCount } from '@/hooks/useDashboardMetrics';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => null,
  Cell: () => null,
  Tooltip: () => null,
}));

const DATA: GenreCount[] = [
  { genre: 'Drama', count: 5 },
  { genre: 'Thriller', count: 3 },
];

describe('GenrePieChart', () => {
  it('renderiza el título del gráfico', () => {
    render(<GenrePieChart data={DATA} />);
    expect(screen.getByText(/series por género/i)).toBeInTheDocument();
  });

  it('renderiza el gráfico de quesito', () => {
    render(<GenrePieChart data={DATA} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('muestra cada género con su recuento en la leyenda', () => {
    render(<GenrePieChart data={DATA} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Drama');
    expect(items[0]).toHaveTextContent('5');
    expect(items[1]).toHaveTextContent('Thriller');
    expect(items[1]).toHaveTextContent('3');
  });

  it('muestra estado vacío cuando no hay datos', () => {
    render(<GenrePieChart data={[]} />);
    expect(screen.getByText(/sin datos disponibles/i)).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});

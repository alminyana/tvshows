import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DurationDistributionChart } from './DurationDistributionChart';
import type { DurationCount } from '@/hooks';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => null,
  Legend: () => null,
  Tooltip: () => null,
}));

const DATA: DurationCount[] = [
  { type: 'miniserie', count: 4 },
  { type: 'single', count: 2 },
  { type: 'multi', count: 6 },
];

describe('DurationDistributionChart', () => {
  it('muestra el título y el gráfico cuando hay datos', () => {
    render(<DurationDistributionChart data={DATA} />);
    expect(screen.getByText(/distribución por duración/i)).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('muestra estado vacío cuando todos los counts son 0', () => {
    const empty: DurationCount[] = [
      { type: 'miniserie', count: 0 },
      { type: 'single', count: 0 },
      { type: 'multi', count: 0 },
    ];
    render(<DurationDistributionChart data={empty} />);
    expect(screen.getByText(/sin datos disponibles/i)).toBeInTheDocument();
    expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
  });
});

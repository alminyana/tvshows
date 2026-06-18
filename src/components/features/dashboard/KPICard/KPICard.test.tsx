import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { KPICard } from './KPICard';

describe('KPICard', () => {
  it('renderiza label y value', () => {
    render(<KPICard label="Total de series" value={19} />);
    expect(screen.getByText('Total de series')).toBeInTheDocument();
    expect(screen.getByText('19')).toBeInTheDocument();
  });

  it('renderiza detail cuando se proporciona', () => {
    render(<KPICard label="Destacadas" value={5} detail="Con valoración ≥ 4" />);
    expect(screen.getByText('Con valoración ≥ 4')).toBeInTheDocument();
  });

  it('no renderiza detail cuando se omite', () => {
    render(<KPICard label="Total" value={0} />);
    expect(screen.queryByText('Con valoración ≥ 4')).not.toBeInTheDocument();
  });

  it('renderiza value 0 correctamente', () => {
    render(<KPICard label="Sin series" value={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renderiza el icono cuando se proporciona (decorativo)', () => {
    const { container } = render(
      <KPICard label="Con icono" value={3} icon={<svg data-testid="kpi-icon" />} />,
    );
    expect(screen.getByTestId('kpi-icon')).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('no renderiza wrapper de icono cuando se omite', () => {
    const { container } = render(<KPICard label="Sin icono" value={1} />);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
  });
});

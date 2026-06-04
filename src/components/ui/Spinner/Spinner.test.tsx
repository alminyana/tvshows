import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('tiene role status', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('usa el label personalizado', () => {
    render(<Spinner label="Guardando…" />);
    expect(screen.getByRole('status', { name: 'Guardando…' })).toBeInTheDocument();
  });
});

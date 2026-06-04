import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renderiza los children', () => {
    render(<Card>contenido</Card>);
    expect(screen.getByText('contenido')).toBeInTheDocument();
  });

  it('aplica una clase con "hoverable" cuando se indica', () => {
    const { container } = render(<Card hoverable>x</Card>);
    expect((container.firstChild as HTMLElement).className).toMatch(/hoverable/);
  });
});

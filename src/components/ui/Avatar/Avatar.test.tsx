import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renderiza la imagen si se pasa src', () => {
    render(<Avatar src="foto.jpg" alt="Usuario" />);
    expect(screen.getByRole('img', { name: 'Usuario' })).toBeInTheDocument();
  });

  it('renderiza las iniciales como fallback', () => {
    render(<Avatar initials="EA" alt="Enric" />);
    expect(screen.getByText('EA')).toBeInTheDocument();
  });

  it('muestra ? si no hay iniciales ni src', () => {
    render(<Avatar />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });
});

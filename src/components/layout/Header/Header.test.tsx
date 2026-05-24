import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/context';
import { Header } from './Header';

function renderHeader() {
  return render(
    <ThemeProvider>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Header />
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('Header', () => {
  it('renderiza el logo', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: /tv shows/i })).toBeInTheDocument();
  });

  it('los enlaces de navegación existen en el DOM', () => {
    renderHeader();
    // Los enlaces están en el DOM pero pueden estar ocultos por CSS responsive
    expect(screen.getByRole('link', { name: /series/i, hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /dashboard/i, hidden: true })).toBeInTheDocument();
  });

  it('el botón de modo existe en el DOM', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: /cambiar modo/i, hidden: true })).toBeInTheDocument();
  });

  it('muestra el botón de login', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('el botón hamburguesa abre y cierra el menú', async () => {
    renderHeader();
    const hamburger = screen.getByRole('button', { name: /abrir menú/i });
    expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(hamburger);
    expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(hamburger);
    expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  });
});

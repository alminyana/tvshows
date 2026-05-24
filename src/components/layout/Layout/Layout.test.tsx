import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/context';
import { Layout } from './Layout';

function renderLayout(content = <p>contenido</p>) {
  return render(
    <ThemeProvider>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={content} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('Layout', () => {
  it('renderiza el header y el contenido del outlet', () => {
    renderLayout(<p>contenido de prueba</p>);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('contenido de prueba')).toBeInTheDocument();
  });

  it('el main tiene role implícito main', () => {
    renderLayout();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});

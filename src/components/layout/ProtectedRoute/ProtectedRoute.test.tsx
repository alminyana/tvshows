import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

vi.mock('@/hooks', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/hooks';

function renderRoute(initialPath = '/protected') {
  return render(
    <MemoryRouter
      initialEntries={[initialPath]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/protected" element={<p>Contenido protegido</p>} />
        </Route>
        <Route path="/series" element={<p>Series</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('muestra spinner mientras carga', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: true, login: vi.fn(), logout: vi.fn() });
    renderRoute();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('redirige a /series si no hay sesión', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, login: vi.fn(), logout: vi.fn() });
    renderRoute();
    expect(screen.getByText('Series')).toBeInTheDocument();
  });

  it('muestra el contenido si hay sesión', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '1', email: 'a@local', password: 'h', role: 'admin', createdAt: '' },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
    renderRoute();
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });
});

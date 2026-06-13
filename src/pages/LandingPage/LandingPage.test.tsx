import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './LandingPage';

const mockNavigate = vi.fn();

vi.mock('@/hooks', () => ({
  useAuth: vi.fn(() => ({ user: null, loading: false, login: vi.fn(), logout: vi.fn() })),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/components/features/LoginModal/LoginModal', () => ({
  LoginModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="login-modal">Modal</div> : null,
}));

import { useAuth } from '@/hooks';

function renderLanding() {
  return render(
    <MemoryRouter initialEntries={['/']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/series" element={<p>Series</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, login: vi.fn(), logout: vi.fn() });
});

describe('LandingPage', () => {
  it('muestra el título y el claim', () => {
    renderLanding();
    expect(screen.getByRole('heading', { name: /tv shows/i })).toBeInTheDocument();
    expect(screen.getByText(/tu colección personal/i)).toBeInTheDocument();
  });

  it('muestra el botón "Entrar"', () => {
    renderLanding();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('abre el LoginModal al pulsar "Entrar"', async () => {
    renderLanding();
    expect(screen.queryByTestId('login-modal')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    expect(screen.getByTestId('login-modal')).toBeInTheDocument();
  });

  it('no muestra nada mientras auth está cargando', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: true, login: vi.fn(), logout: vi.fn() });
    const { container } = renderLanding();
    expect(container.firstChild).toBeNull();
  });

  it('redirige a /series si el usuario ya tiene sesión', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'u1', email: 'a@b.com', password: 'h', role: 'user', createdAt: '' },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
    renderLanding();
    expect(screen.getByText('Series')).toBeInTheDocument();
  });
});

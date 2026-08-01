import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './LandingPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

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
});

describe('LandingPage', () => {
  it('muestra el título y el claim', () => {
    renderLanding();
    expect(screen.getByRole('heading', { name: /tv shows/i })).toBeInTheDocument();
    expect(screen.getByText(/tu colección personal/i)).toBeInTheDocument();
  });

  it('muestra el botón "Acceder"', () => {
    renderLanding();
    expect(screen.getByRole('button', { name: /acceder/i })).toBeInTheDocument();
  });

  it('navega a /series al pulsar "Acceder"', async () => {
    renderLanding();
    await userEvent.click(screen.getByRole('button', { name: /acceder/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/series');
  });
});

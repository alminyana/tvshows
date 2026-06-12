import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SeriesRow } from './SeriesRow';
import type { Series } from '@/types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/services', () => ({
  imageService: { get: vi.fn().mockResolvedValue(null) },
}));

const series: Series = {
  id: 's1',
  title: 'Breaking Bad',
  synopsis: 'Química y crimen.',
  seasons: '5 temporadas',
  cast: ['Bryan Cranston'],
  year: 2008,
  rating: 5,
  genres: ['Drama', 'Thriller'],
  coverImage: 'img-1',
  createdBy: 'u1',
  createdAt: '',
  updatedAt: '',
};

function renderRow() {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SeriesRow series={series} />
    </MemoryRouter>,
  );
}

describe('SeriesRow', () => {
  it('muestra el título', () => {
    renderRow();
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
  });

  it('muestra el año', () => {
    renderRow();
    expect(screen.getByText('2008')).toBeInTheDocument();
  });

  it('muestra los géneros', () => {
    renderRow();
    expect(screen.getByText('Drama')).toBeInTheDocument();
    expect(screen.getByText('Thriller')).toBeInTheDocument();
  });

  it('muestra el rating (estrellas)', () => {
    renderRow();
    expect(screen.getAllByText('★').length).toBeGreaterThan(0);
  });

  it('navega al detalle al hacer click', async () => {
    renderRow();
    await userEvent.click(screen.getByRole('button', { name: 'Breaking Bad' }));
    expect(mockNavigate).toHaveBeenCalledWith('/series/s1');
  });

  it('navega al detalle con Enter', async () => {
    renderRow();
    const row = screen.getByRole('button', { name: 'Breaking Bad' });
    row.focus();
    await userEvent.keyboard('{Enter}');
    expect(mockNavigate).toHaveBeenCalledWith('/series/s1');
  });
});

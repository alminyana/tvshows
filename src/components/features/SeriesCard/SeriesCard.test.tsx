import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SeriesCard } from './SeriesCard';
import type { Series } from '@/types';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/services', () => ({
  imageService: {
    get: vi.fn().mockResolvedValue(undefined),
  },
}));

const mockSeries: Series = {
  id: 'abc-1',
  title: 'Breaking Bad',
  synopsis: 'Sinopsis',
  seasons: 5,
  cast: ['Bryan Cranston'],
  year: 2008,
  rating: 5,
  genres: ['Drama', 'Thriller'],
  coverImage: 'img-1',
  createdBy: 'user-1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

function renderCard() {
  return render(
    <MemoryRouter>
      <SeriesCard series={mockSeries} />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SeriesCard', () => {
  it('muestra título, año y géneros', () => {
    renderCard();
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    expect(screen.getByText('2008')).toBeInTheDocument();
    expect(screen.getByText('Drama')).toBeInTheDocument();
    expect(screen.getByText('Thriller')).toBeInTheDocument();
  });

  it('navega al detalle al hacer click', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: 'Breaking Bad' }));
    expect(mockNavigate).toHaveBeenCalledWith('/series/abc-1');
  });

  it('navega al detalle al pulsar Enter', () => {
    renderCard();
    fireEvent.keyDown(screen.getByRole('button', { name: 'Breaking Bad' }), { key: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith('/series/abc-1');
  });
});

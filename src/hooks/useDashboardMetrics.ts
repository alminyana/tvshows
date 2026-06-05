import { useMemo } from 'react';
import { useSeries } from './useSeries';
import type { Genre } from '../types/genre';

export interface GenreCount {
  genre: Genre;
  count: number;
}

export interface RatingCount {
  rating: number;
  count: number;
}

export interface DashboardMetrics {
  totalSeries: number;
  featuredSeries: number;
  genreDistribution: GenreCount[];
  ratingDistribution: RatingCount[];
  loading: boolean;
  error: string | null;
}

export function useDashboardMetrics(): DashboardMetrics {
  const { series, loading, error } = useSeries();

  const metrics = useMemo(() => {
    const totalSeries = series.length;
    const featuredSeries = series.filter((s) => s.rating >= 4).length;

    const genreMap = new Map<Genre, number>();
    for (const s of series) {
      for (const genre of s.genres) {
        genreMap.set(genre, (genreMap.get(genre) ?? 0) + 1);
      }
    }
    const genreDistribution: GenreCount[] = Array.from(genreMap.entries())
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count);

    const ratingMap = new Map<number, number>();
    for (let r = 1; r <= 5; r++) ratingMap.set(r, 0);
    for (const s of series) {
      ratingMap.set(s.rating, (ratingMap.get(s.rating) ?? 0) + 1);
    }
    const ratingDistribution: RatingCount[] = Array.from(ratingMap.entries())
      .map(([rating, count]) => ({ rating, count }))
      .sort((a, b) => a.rating - b.rating);

    return { totalSeries, featuredSeries, genreDistribution, ratingDistribution };
  }, [series]);

  return { ...metrics, loading, error };
}

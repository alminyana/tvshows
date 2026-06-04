import { useState, useEffect } from 'react';
import { seriesService } from '../services/seriesService';
import type { Series } from '../types/series';

interface UseSeriesByIdResult {
  series: Series | null;
  loading: boolean;
  notFound: boolean;
  error: string | null;
}

export function useSeriesById(id: string): UseSeriesByIdResult {
  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    seriesService
      .getById(id)
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setSeries(data);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Error al cargar la serie');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { series, loading, notFound, error };
}

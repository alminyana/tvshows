import { useState, useEffect } from 'react';
import { seriesService } from '@/services';
import type { Series } from '../types/series';

interface UseSeriesResult {
  series: Series[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useSeries(): UseSeriesResult {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    seriesService
      .getAll()
      .then((data) => {
        if (!cancelled) {
          setSeries(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Error al cargar las series');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  function reload() {
    setLoading(true);
    setError(null);
    setTick((t) => t + 1);
  }

  return { series, loading, error, reload };
}

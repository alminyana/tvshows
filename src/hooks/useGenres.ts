import { useState, useEffect, useCallback } from 'react';
import { genresService } from '@/services';

interface UseGenresResult {
  genres: string[];
  loading: boolean;
  error: string | null;
  add: (name: string) => Promise<string | null>;
}

export function useGenres(): UseGenresResult {
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    genresService
      .getAll()
      .then((data) => {
        if (!cancelled) {
          setGenres(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Error al cargar los géneros');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persiste el género en el catálogo (tabla `genres`) y lo añade al estado local
  // si es nuevo. Devuelve el nombre canónico o `null` si el nombre está vacío.
  const add = useCallback(async (name: string): Promise<string | null> => {
    const canonical = await genresService.add(name);
    if (!canonical) return null;
    setGenres((prev) =>
      prev.some((g) => g.toLowerCase() === canonical.toLowerCase()) ? prev : [...prev, canonical],
    );
    return canonical;
  }, []);

  return { genres, loading, error, add };
}

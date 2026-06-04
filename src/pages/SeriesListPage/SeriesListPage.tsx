import { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSeries, useAuth } from '@/hooks';
import { SeriesCard } from '@/components/features';
import { Spinner, Select, Input, Button } from '@/components/ui';
import { canCreateSeries } from '@/utils/permissions';
import { MESSAGES } from '@/constants';
import { GENRES } from '@/types';
import type { Genre } from '@/types';
import styles from './SeriesListPage.module.scss';

const RATING_OPTIONS = [
  { value: '', label: 'Todas las valoraciones' },
  { value: '5', label: '★★★★★' },
  { value: '4', label: '★★★★ o más' },
  { value: '3', label: '★★★ o más' },
  { value: '2', label: '★★ o más' },
  { value: '1', label: '★ o más' },
];

const GENRE_OPTIONS = [
  { value: '', label: 'Todos los géneros' },
  ...GENRES.map((g) => ({ value: g, label: g })),
];

export function SeriesListPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { series, loading, error } = useSeries();

  const search = params.get('q') ?? '';
  const genre = (params.get('genre') ?? '') as Genre | '';
  const rating = params.get('rating') ?? '';

  const filtered = useMemo(() => {
    return series.filter((s) => {
      if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (genre && !s.genres.includes(genre)) return false;
      if (rating && s.rating < Number(rating)) return false;
      return true;
    });
  }, [series, search, genre, rating]);

  function setParam(key: string, value: string) {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      return next;
    });
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        {canCreateSeries(user) && (
          <Button variant="primary" size="sm" onClick={() => navigate('/series/new')}>
            {MESSAGES.series.newSeries}
          </Button>
        )}
      </div>

      <div className={styles.filters}>
        <Input
          id="series-search"
          placeholder={MESSAGES.series.searchPlaceholder}
          value={search}
          onChange={(e) => setParam('q', e.target.value)}
          aria-label={MESSAGES.actions.search}
        />
        <Select
          id="series-genre"
          options={GENRE_OPTIONS}
          value={genre}
          onChange={(e) => setParam('genre', e.target.value)}
          aria-label={MESSAGES.series.filterByGenre}
        />
        <Select
          id="series-rating"
          options={RATING_OPTIONS}
          value={rating}
          onChange={(e) => setParam('rating', e.target.value)}
          aria-label={MESSAGES.series.filterByRating}
        />
      </div>

      {loading && (
        <div className={styles.center}>
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <p className={styles.error} role="alert">{MESSAGES.errors.generic}</p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className={styles.empty}>{MESSAGES.series.noResults}</p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <ul className={styles.grid} aria-label="Listado de series">
          {filtered.map((s) => (
            <li key={s.id}>
              <SeriesCard series={s} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

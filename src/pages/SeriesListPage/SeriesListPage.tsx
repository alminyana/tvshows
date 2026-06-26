import { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSeries, useAuth, useSeriesViewMode, useGenres } from '@/hooks';
import { SeriesCard, SeriesRow } from '@/components/features';
import { Spinner, Select, Input, Button, Collapsible } from '@/components/ui';
import { canCreateSeries } from '@/utils/permissions';
import { MESSAGES } from '@/constants';
import styles from './SeriesListPage.module.scss';

const RATING_OPTIONS = [
  { value: '', label: 'Todas las valoraciones' },
  { value: '5', label: '★★★★★' },
  { value: '4', label: '★★★★ o más' },
  { value: '3', label: '★★★ o más' },
  { value: '2', label: '★★ o más' },
  { value: '1', label: '★ o más' },
];

export function SeriesListPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { series, loading, error } = useSeries();
  const [viewMode, setViewMode] = useSeriesViewMode();
  const { genres } = useGenres();

  const genreOptions = useMemo(
    () => [{ value: '', label: 'Todos los géneros' }, ...genres.map((g) => ({ value: g, label: g }))],
    [genres],
  );

  const search = params.get('q') ?? '';
  const genre = params.get('genre') ?? '';
  const rating = params.get('rating') ?? '';

  const activeFilterCount = [search, genre, rating].filter(Boolean).length;

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
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewButton} ${viewMode === 'cards' ? styles.viewButtonActive : ''}`}
            onClick={() => setViewMode('cards')}
            aria-label={MESSAGES.series.viewCards}
            aria-pressed={viewMode === 'cards'}
            title={MESSAGES.series.viewCards}
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" width={14} height={14}>
              <rect x="1" y="1" width="6" height="6" rx="1" />
              <rect x="9" y="1" width="6" height="6" rx="1" />
              <rect x="1" y="9" width="6" height="6" rx="1" />
              <rect x="9" y="9" width="6" height="6" rx="1" />
            </svg>
          </button>
          <button
            className={`${styles.viewButton} ${viewMode === 'list' ? styles.viewButtonActive : ''}`}
            onClick={() => setViewMode('list')}
            aria-label={MESSAGES.series.viewList}
            aria-pressed={viewMode === 'list'}
            title={MESSAGES.series.viewList}
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" width={14} height={14}>
              <rect x="1" y="2" width="14" height="2.5" rx="1" />
              <rect x="1" y="6.75" width="14" height="2.5" rx="1" />
              <rect x="1" y="11.5" width="14" height="2.5" rx="1" />
            </svg>
          </button>
        </div>

        {canCreateSeries(user) && (
          <Button variant="primary" size="sm" onClick={() => navigate('/series/new')}>
            {MESSAGES.series.newSeries}
          </Button>
        )}
      </div>

      <div className={styles.filtersWrapper}>
        <Collapsible header={MESSAGES.filters.title} activeCount={activeFilterCount}>
          <Input
            id="series-search"
            placeholder={MESSAGES.series.searchPlaceholder}
            value={search}
            onChange={(e) => setParam('q', e.target.value)}
            aria-label={MESSAGES.actions.search}
          />
          <Select
            id="series-genre"
            options={genreOptions}
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
        </Collapsible>
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

      {!loading && !error && filtered.length > 0 && viewMode === 'cards' && (
        <ul className={styles.grid} aria-label="Listado de series">
          {filtered.map((s) => (
            <li key={s.id}>
              <SeriesCard series={s} />
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && filtered.length > 0 && viewMode === 'list' && (
        <ul className={styles.list} aria-label="Listado de series">
          {filtered.map((s) => (
            <li key={s.id}>
              <SeriesRow series={s} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

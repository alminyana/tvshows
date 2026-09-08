import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSeries, useAuth, useSeriesViewMode, useGenres } from '@/hooks';
import { SeriesCard, SeriesRow } from '@/components/features';
import { Spinner, Select, Input, Button } from '@/components/ui';
import { canCreateSeries } from '@/utils/permissions';
import { MESSAGES } from '@/constants';
import type { ViewMode } from '@/types';
import styles from './SeriesListPage.module.scss';

const RATING_OPTIONS = [
  { value: '', label: 'Todas las valoraciones' },
  { value: '5', label: '★★★★★' },
  { value: '4', label: '★★★★ o más' },
  { value: '3', label: '★★★ o más' },
  { value: '2', label: '★★ o más' },
  { value: '1', label: '★ o más' },
];

const VIEW_BUTTONS: { mode: ViewMode; label: string; icon: ReactNode }[] = [
  {
    mode: 'cards',
    label: MESSAGES.series.viewCards,
    icon: (
      <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" width={14} height={14}>
        <rect x="1" y="1" width="6" height="6" rx="1" />
        <rect x="9" y="1" width="6" height="6" rx="1" />
        <rect x="1" y="9" width="6" height="6" rx="1" />
        <rect x="9" y="9" width="6" height="6" rx="1" />
      </svg>
    ),
  },
  {
    mode: 'mosaic',
    label: MESSAGES.series.viewMosaic,
    icon: (
      <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" width={14} height={14}>
        <rect x="1" y="1" width="3.6" height="3.6" rx=".8" />
        <rect x="6.2" y="1" width="3.6" height="3.6" rx=".8" />
        <rect x="11.4" y="1" width="3.6" height="3.6" rx=".8" />
        <rect x="1" y="6.2" width="3.6" height="3.6" rx=".8" />
        <rect x="6.2" y="6.2" width="3.6" height="3.6" rx=".8" />
        <rect x="11.4" y="6.2" width="3.6" height="3.6" rx=".8" />
        <rect x="1" y="11.4" width="3.6" height="3.6" rx=".8" />
        <rect x="6.2" y="11.4" width="3.6" height="3.6" rx=".8" />
        <rect x="11.4" y="11.4" width="3.6" height="3.6" rx=".8" />
      </svg>
    ),
  },
  {
    mode: 'list',
    label: MESSAGES.series.viewList,
    icon: (
      <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" width={14} height={14}>
        <rect x="1" y="2" width="14" height="2.5" rx="1" />
        <rect x="1" y="6.75" width="14" height="2.5" rx="1" />
        <rect x="1" y="11.5" width="14" height="2.5" rx="1" />
      </svg>
    ),
  },
];

function SearchIcon() {
  return (
    <svg
      className={styles.searchIcon}
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      width={15}
      height={15}
    >
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5 L14.5 14.5" />
    </svg>
  );
}

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

  function clearAllFilters() {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      ['q', 'genre', 'rating'].forEach((key) => next.delete(key));
      return next;
    });
  }

  // Un chip por filtro activo; quitarlo solo borra su clave del query string.
  const activeFilters = [
    search && { key: 'q', label: MESSAGES.filters.searchChip(search) },
    genre && { key: 'genre', label: genre },
    rating && { key: 'rating', label: MESSAGES.filters.ratingChip(Number(rating)) },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <div className={styles.page}>
      <div className={styles.bar}>
        <span className={styles.search}>
          <SearchIcon />
          <Input
            id="series-search"
            type="search"
            className={styles.searchInput}
            placeholder={MESSAGES.series.searchPlaceholder}
            value={search}
            onChange={(e) => setParam('q', e.target.value)}
            aria-label={MESSAGES.actions.search}
          />
        </span>

        <Select
          id="series-genre"
          className={styles.filterSelect}
          options={genreOptions}
          value={genre}
          onChange={(e) => setParam('genre', e.target.value)}
          aria-label={MESSAGES.series.filterByGenre}
        />

        <Select
          id="series-rating"
          className={styles.filterSelect}
          options={RATING_OPTIONS}
          value={rating}
          onChange={(e) => setParam('rating', e.target.value)}
          aria-label={MESSAGES.series.filterByRating}
        />

        <span className={styles.spacer} />

        <div className={styles.viewToggle} role="group" aria-label={MESSAGES.series.view}>
          {VIEW_BUTTONS.map(({ mode, label, icon }) => (
            <button
              key={mode}
              className={`${styles.viewButton} ${viewMode === mode ? styles.viewButtonActive : ''}`}
              onClick={() => setViewMode(mode)}
              aria-label={label}
              aria-pressed={viewMode === mode}
              title={label}
            >
              {icon}
            </button>
          ))}
        </div>

        {canCreateSeries(user) && (
          <Button variant="primary" size="sm" onClick={() => navigate('/series/new')}>
            {MESSAGES.series.newSeries}
          </Button>
        )}
      </div>

      {!loading && !error && (
        <div className={styles.applied}>
          <span className={styles.count}>
            {activeFilters.length > 0
              ? MESSAGES.filters.countFiltered(filtered.length, series.length)
              : MESSAGES.filters.count(series.length)}
          </span>
          {activeFilters.map(({ key, label }) => (
            <span key={key} className={styles.filterChip}>
              {label}
              <button
                type="button"
                onClick={() => setParam(key, '')}
                aria-label={MESSAGES.filters.removeFilter(label)}
              >
                ×
              </button>
            </span>
          ))}
          {activeFilters.length > 0 && (
            <button type="button" className={styles.clearAll} onClick={clearAllFilters}>
              {MESSAGES.filters.clearAll}
            </button>
          )}
        </div>
      )}

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

      {!loading && !error && filtered.length > 0 && viewMode === 'mosaic' && (
        <ul className={styles.gridMosaic} aria-label="Listado de series">
          {filtered.map((s) => (
            <li key={s.id}>
              <SeriesCard series={s} variant="mosaic" />
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

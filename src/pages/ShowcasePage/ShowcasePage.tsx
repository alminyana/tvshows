import { useState } from 'react';
import { useTheme } from '@/hooks';
import { MESSAGES } from '@/constants';
import type { Theme, ThemeMode, Series } from '@/types';
import type { GenreCount, RatingCount, DurationCount } from '@/hooks/useDashboardMetrics';
import {
  Button, Tag, Rating, Spinner, Avatar,
  Input, Textarea, Select, FormField, FileInput,
  Modal, ConfirmDialog, IconButton,
} from '@/components/ui';
import { KPICard } from '@/components/features/dashboard/KPICard/KPICard';
import { GenreDistributionChart } from '@/components/features/dashboard/GenreDistributionChart/GenreDistributionChart';
import { GenrePieChart } from '@/components/features/dashboard/GenrePieChart/GenrePieChart';
import { RatingDistributionChart } from '@/components/features/dashboard/RatingDistributionChart/RatingDistributionChart';
import { DurationDistributionChart } from '@/components/features/dashboard/DurationDistributionChart/DurationDistributionChart';
import {
  CollectionIcon, StarIcon, MiniseriesIcon, LayersIcon,
} from '@/components/features/dashboard/icons';
import { SeriesCard } from '@/components/features/SeriesCard/SeriesCard';
import { SeriesRow } from '@/components/features/SeriesRow/SeriesRow';
import styles from './ShowcasePage.module.scss';

const THEMES: Theme[] = ['default', 'ocean', 'sunset', 'forest', 'amatista', 'carmesi', 'cian', 'crepusculo'];
const MODES: ThemeMode[] = ['light', 'dark'];

// Datos mock con la misma forma que devuelve useDashboardMetrics, para alimentar
// los componentes reales del dashboard sin tocar la BD.
const MOCK_GENRE_DISTRIBUTION: GenreCount[] = [
  { genre: 'Drama', count: 8 },
  { genre: 'Thriller', count: 5 },
  { genre: 'Comedia', count: 4 },
  { genre: 'Ciencia ficción', count: 3 },
  { genre: 'Fantasía', count: 2 },
];

const MOCK_RATING_DISTRIBUTION: RatingCount[] = [
  { rating: 1, count: 1 },
  { rating: 2, count: 2 },
  { rating: 3, count: 4 },
  { rating: 4, count: 7 },
  { rating: 5, count: 5 },
];

const MOCK_DURATION_DISTRIBUTION: DurationCount[] = [
  { type: 'miniserie', count: 3 },
  { type: 'single', count: 7 },
  { type: 'multi', count: 9 },
];

const MOCK_SERIES: Series[] = [
  {
    id: 'showcase-1',
    coverImage: '',
    title: 'Breaking Bad',
    synopsis: 'Un profesor de química diagnosticado con cáncer terminal se convierte en fabricante de metanfetamina.',
    seasons: '5 temporadas (2008–2013).',
    cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn'],
    year: 2008,
    rating: 5,
    genres: ['Drama', 'Thriller'],
    createdBy: 'showcase',
    createdAt: '2008-01-20T00:00:00.000Z',
    updatedAt: '2013-09-29T00:00:00.000Z',
  },
  {
    id: 'showcase-2',
    coverImage: '',
    title: 'The Wire',
    synopsis: 'Retrato coral del narcotráfico y las instituciones de Baltimore.',
    seasons: '5 temporadas (2002–2008).',
    cast: ['Dominic West', 'Idris Elba'],
    year: 2002,
    rating: 5,
    genres: ['Drama', 'Thriller'],
    createdBy: 'showcase',
    createdAt: '2002-06-02T00:00:00.000Z',
    updatedAt: '2008-03-09T00:00:00.000Z',
  },
  {
    id: 'showcase-3',
    coverImage: '',
    title: 'Chernobyl',
    synopsis: 'Dramatización del accidente nuclear de 1986 y sus consecuencias.',
    seasons: 'Miniserie (5 episodios).',
    cast: ['Jared Harris', 'Stellan Skarsgård'],
    year: 2019,
    rating: 4,
    genres: ['Drama', 'Documental'],
    createdBy: 'showcase',
    createdAt: '2019-05-06T00:00:00.000Z',
    updatedAt: '2019-06-03T00:00:00.000Z',
  },
];

export function ShowcasePage() {
  const { theme, mode, setTheme, setMode } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(3);

  return (
    <div className={styles.page}>
      <header className={styles.sectionHeader}>
        <h1>{MESSAGES.showcase.title}</h1>
      </header>

      {/* ─── Selector de tema ────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Temas (16 combinaciones)</h2>
        <div className={styles.themeGrid}>
          {THEMES.map((t) =>
            MODES.map((m) => (
              <button
                key={`${t}-${m}`}
                className={[
                  styles.themeChip,
                  theme === t && mode === m ? styles.themeChipActive : '',
                ].join(' ')}
                onClick={() => { setTheme(t); setMode(m); }}
              >
                {MESSAGES.theme.names[t]} · {m === 'light' ? MESSAGES.theme.modeLight : MESSAGES.theme.modeDark}
              </button>
            ))
          )}
        </div>
      </section>

      {/* ─── Buttons ─────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Button</h2>
        <div className={styles.row}>
          {(['primary', 'secondary', 'ghost', 'danger'] as const).map((v) => (
            <Button key={v} variant={v}>{v}</Button>
          ))}
          <Button isLoading>Cargando</Button>
          <Button disabled>Deshabilitado</Button>
        </div>
        <div className={styles.row}>
          {(['sm', 'md', 'lg'] as const).map((s) => (
            <Button key={s} size={s}>{s}</Button>
          ))}
        </div>
      </section>

      {/* ─── IconButton ──────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>IconButton</h2>
        <div className={styles.row}>
          <IconButton icon="✏️" label="Editar" variant="default" />
          <IconButton icon="🗑️" label="Eliminar" variant="danger" />
          <IconButton icon="✕" label="Cerrar" variant="ghost" />
        </div>
      </section>

      {/* ─── Inputs ──────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Input / Textarea / Select</h2>
        <div className={styles.formGrid}>
          <FormField label="Título" htmlFor="sc-title" required>
            <Input id="sc-title" placeholder="Nombre de la serie" />
          </FormField>
          <FormField label="Año" htmlFor="sc-year" error="El año es obligatorio.">
            <Input id="sc-year" type="number" hasError />
          </FormField>
          <FormField label="Sinopsis" htmlFor="sc-synopsis">
            <Textarea id="sc-synopsis" rows={3} placeholder="Descripción…" />
          </FormField>
          <FormField label="Género" htmlFor="sc-genre">
            <Select
              id="sc-genre"
              options={[
                { value: 'drama', label: 'Drama' },
                { value: 'thriller', label: 'Thriller' },
                { value: 'comedia', label: 'Comedia' },
              ]}
            />
          </FormField>
          <FormField label="Portada">
            <FileInput
              accept="image/jpeg,image/png,image/webp"
              onChange={() => undefined}
              ariaLabel="Portada"
              buttonLabel="Seleccionar imagen"
              fileName="portada.jpg"
            />
          </FormField>
        </div>
      </section>

      {/* ─── Tags ────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Tag / Chip</h2>
        <div className={styles.row}>
          {MOCK_SERIES[0].cast.map((name) => (
            <Tag key={name} label={name} onRemove={() => undefined} />
          ))}
          {MOCK_SERIES[0].genres.map((g) => (
            <Tag key={g} label={g} />
          ))}
        </div>
      </section>

      {/* ─── Rating ──────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Rating</h2>
        <div className={styles.row}>
          <span>Read-only (4):</span>
          <Rating value={4} readOnly />
          <span>Interactivo:</span>
          <Rating value={ratingValue} onChange={setRatingValue} />
        </div>
      </section>

      {/* ─── Spinner / Avatar ────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Spinner · Avatar</h2>
        <div className={styles.row}>
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <Avatar initials="EA" alt="Enric Almiñana" size="sm" />
          <Avatar initials="AB" size="md" />
          <Avatar initials="CD" size="lg" />
        </div>
      </section>

      {/* ─── SeriesCard (componente real) ────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>SeriesCard</h2>
        <div className={styles.cardGrid}>
          {MOCK_SERIES.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </div>
      </section>

      {/* ─── SeriesRow (componente real) ─────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>SeriesRow</h2>
        <div className={styles.rowList}>
          {MOCK_SERIES.map((s) => (
            <SeriesRow key={s.id} series={s} />
          ))}
        </div>
      </section>

      {/* ─── Modal / ConfirmDialog ───────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Modal · ConfirmDialog</h2>
        <div className={styles.row}>
          <Button variant="secondary" onClick={() => setModalOpen(true)}>Abrir Modal</Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>Abrir ConfirmDialog</Button>
        </div>
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Modal de ejemplo">
          <p>Contenido del modal. Pulsa Escape o el botón × para cerrar.</p>
        </Modal>
        <ConfirmDialog
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => setConfirmOpen(false)}
          title="¿Eliminar esta serie?"
          message="Esta acción no se puede deshacer."
        />
      </section>

      {/* ─── KPI Cards (componentes reales del dashboard) ────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>KPICard (dashboard)</h2>
        <div className={styles.kpiGrid}>
          <KPICard
            label={MESSAGES.dashboard.totalSeries}
            value={19}
            icon={<CollectionIcon />}
            accent="var(--kpi-accent-1)"
          />
          <KPICard
            label={MESSAGES.dashboard.featuredSeries}
            value={12}
            detail={MESSAGES.dashboard.featuredDetail}
            icon={<StarIcon />}
            accent="var(--kpi-accent-2)"
          />
          <KPICard
            label={MESSAGES.dashboard.miniseries}
            value={3}
            detail={MESSAGES.dashboard.miniseriesDetail}
            icon={<MiniseriesIcon />}
            accent="var(--kpi-accent-3)"
          />
          <KPICard
            label={MESSAGES.dashboard.multiSeason}
            value={9}
            detail={MESSAGES.dashboard.multiSeasonDetail}
            icon={<LayersIcon />}
            accent="var(--kpi-accent-4)"
          />
        </div>
      </section>

      {/* ─── Charts (componentes reales del dashboard) ───────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Charts (dashboard)</h2>
        <div className={styles.chartGrid}>
          <GenreDistributionChart data={MOCK_GENRE_DISTRIBUTION} />
          <GenrePieChart data={MOCK_GENRE_DISTRIBUTION} />
          <RatingDistributionChart data={MOCK_RATING_DISTRIBUTION} />
          <DurationDistributionChart data={MOCK_DURATION_DISTRIBUTION} />
        </div>
      </section>
    </div>
  );
}

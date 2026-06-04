import { useState } from 'react';
import { useTheme } from '@/hooks';
import { MESSAGES } from '@/constants';
import type { Theme, ThemeMode } from '@/types';
import {
  Button, Card, Tag, Rating, Spinner, Avatar,
  Input, Textarea, Select, FormField,
  Modal, ConfirmDialog, IconButton,
} from '@/components/ui';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import styles from './ShowcasePage.module.scss';

const THEMES: Theme[] = ['default', 'ocean', 'sunset', 'forest'];
const MODES: ThemeMode[] = ['light', 'dark'];

const DUMMY_GENRES = [
  { name: 'Drama', count: 8 },
  { name: 'Thriller', count: 5 },
  { name: 'Comedia', count: 4 },
  { name: 'Ciencia ficción', count: 3 },
  { name: 'Fantasía', count: 2 },
];

const DUMMY_RATINGS = [
  { star: '★', count: 1 },
  { star: '★★', count: 2 },
  { star: '★★★', count: 4 },
  { star: '★★★★', count: 7 },
  { star: '★★★★★', count: 5 },
];

const MOCK_SERIES = {
  title: 'Breaking Bad',
  year: 2008,
  seasons: 5,
  rating: 5,
  genres: ['Drama', 'Thriller'],
  synopsis: 'Un profesor de química diagnosticado con cáncer terminal se convierte en fabricante de metanfetamina.',
  cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn'],
};

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
        <h2 className={styles.sectionTitle}>Temas (8 combinaciones)</h2>
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
        </div>
      </section>

      {/* ─── Tags ────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Tag / Chip</h2>
        <div className={styles.row}>
          {MOCK_SERIES.cast.map((name) => (
            <Tag key={name} label={name} onRemove={() => undefined} />
          ))}
          {MOCK_SERIES.genres.map((g) => (
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

      {/* ─── Card mock ───────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>SeriesCard (mockup)</h2>
        <div className={styles.cardGrid}>
          {[MOCK_SERIES, { ...MOCK_SERIES, title: 'The Wire', year: 2002, rating: 5, seasons: 5 }].map((s) => (
            <Card key={s.title} hoverable className={styles.seriesCard}>
              <div className={styles.cardCover}>
                <Avatar initials={s.title.substring(0, 2).toUpperCase()} size="lg" />
              </div>
              <div className={styles.cardInfo}>
                <strong className={styles.cardTitle}>{s.title}</strong>
                <span className={styles.cardYear}>{s.year}</span>
                <Rating value={s.rating} readOnly />
                <div className={styles.cardTags}>
                  {s.genres.map((g) => <Tag key={g} label={g} />)}
                </div>
              </div>
            </Card>
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

      {/* ─── KPI cards (dashboard mockup) ───────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>KPI Cards (mockup dashboard)</h2>
        <div className={styles.kpiGrid}>
          <Card className={styles.kpi}>
            <p className={styles.kpiLabel}>{MESSAGES.dashboard.totalSeries}</p>
            <p className={styles.kpiValue}>19</p>
          </Card>
          <Card className={styles.kpi}>
            <p className={styles.kpiLabel}>{MESSAGES.dashboard.featuredSeries}</p>
            <p className={styles.kpiValue}>12</p>
            <p className={styles.kpiDetail}>{MESSAGES.dashboard.featuredDetail}</p>
          </Card>
        </div>
      </section>

      {/* ─── Gráfico Recharts ────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recharts (mockup)</h2>
        <div className={styles.chartRow}>
          <Card className={styles.chart}>
            <p className={styles.chartTitle}>{MESSAGES.dashboard.genreDistribution}</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={DUMMY_GENRES} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {DUMMY_GENRES.map((_, i) => (
                    <Cell key={i} fill="var(--color-primary)" opacity={0.7 + i * 0.05} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className={styles.chart}>
            <p className={styles.chartTitle}>{MESSAGES.dashboard.ratingDistribution}</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={DUMMY_RATINGS} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                <XAxis dataKey="star" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </section>
    </div>
  );
}

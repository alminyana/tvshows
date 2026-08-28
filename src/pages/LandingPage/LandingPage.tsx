import { useNavigate } from 'react-router-dom';
import { useDashboardMetrics } from '@/hooks';
import { imageService } from '@/services';
import { Button, Card, Rating, Tag } from '@/components/ui';
import { KPICard } from '@/components/features/dashboard/KPICard/KPICard';
import {
  ChartBarIcon,
  CollectionIcon,
  LayersIcon,
  MiniseriesIcon,
  StarIcon,
} from '@/components/features/dashboard/icons';
import { MESSAGES, VALID_THEMES } from '@/constants';
import { categoricalColor } from '@/utils';
import type { Series } from '@/types';
import styles from './LandingPage.module.scss';

/** Portadas reales que alimentan la tira y el fondo del hero. */
const MOSAIC_SIZE = 12;
/** Teselas del fondo del hero: se repiten las portadas hasta cubrir la rejilla. */
const HERO_TILES = 24;
const TOP_GENRES = 5;
const PREVIEW_GENRES = 3;

export function LandingPage() {
  const navigate = useNavigate();
  const {
    series,
    totalSeries,
    featuredSeries,
    miniseriesCount,
    multiSeasonCount,
    genreDistribution,
    loading,
    error,
  } = useDashboardMetrics();

  const hasData = !loading && !error && totalSeries > 0;

  const covers = series.filter((s) => s.coverImage).slice(0, MOSAIC_SIZE);
  const heroTiles = covers.length
    ? Array.from({ length: HERO_TILES }, (_, i) => covers[i % covers.length])
    : [];

  const years = series.map((s) => s.year).filter((y): y is number => Number.isFinite(y));
  const yearsRange = years.length ? { from: Math.min(...years), to: Math.max(...years) } : null;

  const topGenres = genreDistribution.slice(0, TOP_GENRES);
  const maxGenreCount = topGenres[0]?.count ?? 0;

  const preview: Series | undefined = covers[0];
  const previewGenres = preview ? Array.from(new Set(preview.genres)).slice(0, PREVIEW_GENRES) : [];

  return (
    <main className={styles.page}>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBackground} aria-hidden="true">
          {heroTiles.length > 0 ? (
            <div className={styles.heroTiles}>
              {heroTiles.map((s, i) => (
                <img
                  key={`${s.id}-${i}`}
                  src={imageService.getUrl(s.coverImage)}
                  alt=""
                  className={styles.heroTile}
                />
              ))}
            </div>
          ) : (
            <div className={styles.heroFallback} />
          )}
          <div className={styles.heroWash} />
          <div className={styles.heroFade} />
        </div>

        <div className={styles.heroContent}>
          <p className={styles.kicker}>
            {MESSAGES.landing.kicker}
            {yearsRange
              ? ` · ${MESSAGES.landing.kickerYears(yearsRange.from, yearsRange.to)}`
              : ''}
          </p>
          <h1 className={styles.title}>{MESSAGES.landing.title}</h1>
          <p className={styles.claim}>{MESSAGES.landing.claim}</p>
          <p className={styles.intro}>
            {hasData ? `${MESSAGES.landing.introCount(totalSeries)} ` : ''}
            {MESSAGES.landing.introTail}
          </p>
          <div className={styles.heroActions}>
            <Button variant="primary" size="lg" onClick={() => navigate('/series')}>
              {MESSAGES.landing.enter}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className={styles.heroGhost}
              onClick={() => navigate('/dashboard')}
            >
              {MESSAGES.landing.viewDashboard}
            </Button>
          </div>
        </div>

        <p className={styles.scrollCue} aria-hidden="true">
          <span>{MESSAGES.landing.scrollCue}</span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            focusable="false"
          >
            <path d="M12 5v14M6 13l6 6 6-6" />
          </svg>
        </p>
      </section>

      {/* ── La colección en cifras ──────────────────────────────────────── */}
      {hasData && (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <header className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{MESSAGES.landing.stats.title}</h2>
              <p className={styles.sectionSubtitle}>{MESSAGES.landing.stats.subtitle}</p>
            </header>
            <div className={styles.kpiGrid}>
              <KPICard
                label={MESSAGES.dashboard.totalSeries}
                value={totalSeries}
                icon={<CollectionIcon />}
                accent="var(--color-primary)"
              />
              <KPICard
                label={MESSAGES.dashboard.featuredSeries}
                value={featuredSeries}
                detail={MESSAGES.dashboard.featuredDetail}
                icon={<StarIcon />}
                accent="var(--color-accent)"
              />
              <KPICard
                label={MESSAGES.dashboard.miniseries}
                value={miniseriesCount}
                detail={MESSAGES.dashboard.miniseriesDetail}
                icon={<MiniseriesIcon />}
                accent="var(--color-tertiary)"
              />
              <KPICard
                label={MESSAGES.dashboard.multiSeason}
                value={multiSeasonCount}
                detail={MESSAGES.dashboard.multiSeasonDetail}
                icon={<LayersIcon />}
                accent="var(--color-success)"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Un vistazo a la colección ───────────────────────────────────── */}
      {covers.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <header className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{MESSAGES.landing.mosaic.title}</h2>
              <p className={styles.sectionSubtitle}>{MESSAGES.landing.mosaic.subtitle}</p>
            </header>
          </div>
          <div className={styles.strip}>
            <ul className={styles.stripTrack}>
              {covers.map((s) => (
                <li key={s.id} className={styles.stripItem}>
                  <img src={imageService.getUrl(s.coverImage)} alt={s.title} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Qué encuentras dentro ───────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{MESSAGES.landing.inside.title}</h2>
            <p className={styles.sectionSubtitle}>{MESSAGES.landing.inside.subtitle}</p>
          </header>

          <div className={styles.insideGrid}>
            <Card padding="lg" className={styles.insideCard}>
              <span className={styles.insideIcon} aria-hidden="true">
                <CollectionIcon />
              </span>
              <div className={styles.insideHeading}>
                <h3 className={styles.insideTitle}>{MESSAGES.landing.inside.catalogTitle}</h3>
                <p className={styles.insideText}>{MESSAGES.landing.inside.catalogText}</p>
              </div>
              {preview && (
                <div className={styles.insidePreview}>
                  <img
                    src={imageService.getUrl(preview.coverImage)}
                    alt=""
                    className={styles.previewCover}
                  />
                  <div className={styles.previewMeta}>
                    {previewGenres.length > 0 && (
                      <div className={styles.previewGenres}>
                        {previewGenres.map((g, i) => (
                          <Tag key={g} label={g} color={categoricalColor(i)} />
                        ))}
                      </div>
                    )}
                    <Rating value={preview.rating} readOnly />
                  </div>
                </div>
              )}
            </Card>

            <Card padding="lg" className={styles.insideCard}>
              <span className={styles.insideIcon} aria-hidden="true">
                <ChartBarIcon />
              </span>
              <div className={styles.insideHeading}>
                <h3 className={styles.insideTitle}>{MESSAGES.landing.inside.dashboardTitle}</h3>
                <p className={styles.insideText}>{MESSAGES.landing.inside.dashboardText}</p>
              </div>
              {topGenres.length > 0 && (
                <div className={styles.genreChart}>
                  <p className={styles.genreChartLabel}>
                    {MESSAGES.landing.inside.genreChartLabel}
                  </p>
                  <ul className={styles.genreRows}>
                    {topGenres.map(({ genre, count }) => (
                      <li key={genre} className={styles.genreRow}>
                        <span className={styles.genreName}>{genre}</span>
                        <span className={styles.genreTrack}>
                          <span
                            className={styles.genreBar}
                            style={{ width: `${(count / maxGenreCount) * 100}%` }}
                          />
                        </span>
                        <span className={styles.genreCount}>{count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* ── Entra sin cuenta ────────────────────────────────────────────── */}
      <section className={styles.accessBand}>
        <div className={styles.accessInner}>
          <h2 className={styles.sectionTitle}>{MESSAGES.landing.access.title}</h2>
          <p className={styles.accessText}>{MESSAGES.landing.access.text}</p>
          <Button variant="primary" size="lg" onClick={() => navigate('/series')}>
            {MESSAGES.landing.enter}
          </Button>
        </div>
      </section>

      {/* ── Pie ─────────────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerBrand}>{MESSAGES.landing.footer.brand}</p>
          <div className={styles.footerThemes}>
            <span className={styles.swatches} aria-hidden="true">
              {VALID_THEMES.map((theme) => (
                <span
                  key={theme}
                  className={styles.swatch}
                  style={{ background: `var(--swatch-${theme})` }}
                />
              ))}
            </span>
            <p className={styles.footerNote}>
              {MESSAGES.landing.footer.themes(VALID_THEMES.length)}
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

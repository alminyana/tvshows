import { useDashboardMetrics } from '@/hooks';
import { MESSAGES } from '@/constants';
import { Spinner } from '@/components/ui';
import { KPICard } from '@/components/features/dashboard/KPICard/KPICard';
import { GenreDistributionChart } from '@/components/features/dashboard/GenreDistributionChart/GenreDistributionChart';
import { RatingDistributionChart } from '@/components/features/dashboard/RatingDistributionChart/RatingDistributionChart';
import { GenrePieChart } from '@/components/features/dashboard/GenrePieChart/GenrePieChart';
import { DurationDistributionChart } from '@/components/features/dashboard/DurationDistributionChart/DurationDistributionChart';
import {
  CollectionIcon,
  StarIcon,
  MiniseriesIcon,
  LayersIcon,
} from '@/components/features/dashboard/icons';
import styles from './DashboardPage.module.scss';

export function DashboardPage() {
  const {
    totalSeries,
    featuredSeries,
    miniseriesCount,
    multiSeasonCount,
    genreDistribution,
    ratingDistribution,
    durationDistribution,
    loading,
    error,
  } = useDashboardMetrics();

  if (loading) return <div className={styles.center}><Spinner size="lg" /></div>;
  if (error) return <p className={styles.error} role="alert">{error}</p>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{MESSAGES.dashboard.title}</h1>

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

      <div className={styles.chartGrid}>
        <GenrePieChart data={genreDistribution} className={styles.chartWide} />
        <GenreDistributionChart data={genreDistribution} />
        <RatingDistributionChart data={ratingDistribution} />
        <DurationDistributionChart data={durationDistribution} />
      </div>
    </div>
  );
}

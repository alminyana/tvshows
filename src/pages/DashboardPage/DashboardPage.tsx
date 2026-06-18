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
          accent="#6366f1"
        />
        <KPICard
          label={MESSAGES.dashboard.featuredSeries}
          value={featuredSeries}
          detail={MESSAGES.dashboard.featuredDetail}
          icon={<StarIcon />}
          accent="#f59e0b"
        />
        <KPICard
          label={MESSAGES.dashboard.miniseries}
          value={miniseriesCount}
          detail={MESSAGES.dashboard.miniseriesDetail}
          icon={<MiniseriesIcon />}
          accent="#8b5cf6"
        />
        <KPICard
          label={MESSAGES.dashboard.multiSeason}
          value={multiSeasonCount}
          detail={MESSAGES.dashboard.multiSeasonDetail}
          icon={<LayersIcon />}
          accent="#10b981"
        />
      </div>

      <div className={styles.chartGrid}>
        <GenreDistributionChart data={genreDistribution} />
        <GenrePieChart data={genreDistribution} />
        <RatingDistributionChart data={ratingDistribution} />
        <DurationDistributionChart data={durationDistribution} />
      </div>
    </div>
  );
}

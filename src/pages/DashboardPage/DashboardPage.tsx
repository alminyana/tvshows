import { useDashboardMetrics } from '@/hooks';
import { MESSAGES } from '@/constants';
import { Spinner } from '@/components/ui';
import { KPICard } from '@/components/features/dashboard/KPICard/KPICard';
import { GenreDistributionChart } from '@/components/features/dashboard/GenreDistributionChart/GenreDistributionChart';
import { RatingDistributionChart } from '@/components/features/dashboard/RatingDistributionChart/RatingDistributionChart';
import { GenrePieChart } from '@/components/features/dashboard/GenrePieChart/GenrePieChart';
import styles from './DashboardPage.module.scss';

export function DashboardPage() {
  const { totalSeries, featuredSeries, genreDistribution, ratingDistribution, loading, error } =
    useDashboardMetrics();

  if (loading) return <div className={styles.center}><Spinner size="lg" /></div>;
  if (error) return <p className={styles.error} role="alert">{error}</p>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{MESSAGES.dashboard.title}</h1>

      <div className={styles.kpiGrid}>
        <KPICard label={MESSAGES.dashboard.totalSeries} value={totalSeries} />
        <KPICard
          label={MESSAGES.dashboard.featuredSeries}
          value={featuredSeries}
          detail={MESSAGES.dashboard.featuredDetail}
        />
      </div>

      <div className={styles.chartGrid}>
        <GenreDistributionChart data={genreDistribution} />
        <RatingDistributionChart data={ratingDistribution} />
        <GenrePieChart data={genreDistribution} />
      </div>
    </div>
  );
}

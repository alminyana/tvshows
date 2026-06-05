import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui';
import { MESSAGES } from '@/constants';
import type { GenreCount } from '@/hooks/useDashboardMetrics';
import styles from './GenreDistributionChart.module.scss';

interface GenreDistributionChartProps {
  data: GenreCount[];
}

export function GenreDistributionChart({ data }: GenreDistributionChartProps) {
  const chartData = data.map((d) => ({ name: d.genre, count: d.count }));

  return (
    <Card className={styles.card}>
      <p className={styles.title}>{MESSAGES.dashboard.genreDistribution}</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

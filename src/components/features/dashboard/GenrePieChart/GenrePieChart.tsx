import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui';
import { MESSAGES } from '@/constants';
import type { GenreCount } from '@/hooks/useDashboardMetrics';
import styles from './GenrePieChart.module.scss';

interface GenrePieChartProps {
  data: GenreCount[];
}

const PIE_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444',
  '#3b82f6', '#8b5cf6', '#f97316', '#14b8a6',
  '#ec4899', '#84cc16',
];

const TOOLTIP_STYLE = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '6px',
  color: 'var(--color-text)',
  fontSize: '12px',
};

export function GenrePieChart({ data }: GenrePieChartProps) {
  if (data.length === 0) {
    return (
      <Card className={styles.card}>
        <p className={styles.title}>{MESSAGES.dashboard.genrePieChart}</p>
        <p className={styles.empty}>{MESSAGES.dashboard.noData}</p>
      </Card>
    );
  }

  const chartData = data.map((d) => ({ name: d.genre, value: d.count }));

  return (
    <Card className={styles.card}>
      <p className={styles.title}>{MESSAGES.dashboard.genrePieChart}</p>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={40}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            itemStyle={{ color: 'var(--color-text)' }}
            labelStyle={{ color: 'var(--color-text-muted)' }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', color: 'var(--color-text-muted)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

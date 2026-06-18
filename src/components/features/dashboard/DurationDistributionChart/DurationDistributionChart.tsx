import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui';
import { MESSAGES } from '@/constants';
import type { DurationCount } from '@/hooks';
import type { SeasonsType } from '@/utils/classifySeasons';
import { ClockIcon } from '../icons';
import styles from './DurationDistributionChart.module.scss';

interface DurationDistributionChartProps {
  data: DurationCount[];
}

const COLORS: Record<SeasonsType, string> = {
  miniserie: '#8b5cf6',
  single: '#3b82f6',
  multi: '#10b981',
};

const LABELS: Record<SeasonsType, string> = {
  miniserie: MESSAGES.dashboard.durationMiniserie,
  single: MESSAGES.dashboard.durationSingle,
  multi: MESSAGES.dashboard.durationMulti,
};

const TOOLTIP_STYLE = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '6px',
  color: 'var(--color-text)',
  fontSize: '12px',
};

export function DurationDistributionChart({ data }: DurationDistributionChartProps) {
  const header = (
    <div className={styles.header}>
      <ClockIcon className={styles.icon} />
      <p className={styles.title}>{MESSAGES.dashboard.durationDistribution}</p>
    </div>
  );

  const hasData = data.some((d) => d.count > 0);
  if (!hasData) {
    return (
      <Card className={styles.card}>
        {header}
        <p className={styles.empty}>{MESSAGES.dashboard.noData}</p>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    name: LABELS[d.type],
    value: d.count,
    fill: COLORS[d.type],
  }));

  return (
    <Card className={styles.card}>
      {header}
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
            {chartData.map((d) => (
              <Cell key={d.name} fill={d.fill} />
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

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui';
import { MESSAGES } from '@/constants';
import type { GenreCount } from '@/hooks/useDashboardMetrics';
import { ChartPieIcon } from '../icons';
import styles from './GenrePieChart.module.scss';

interface GenrePieChartProps {
  data: GenreCount[];
  className?: string;
}

const header = (
  <div className={styles.header}>
    <ChartPieIcon className={styles.icon} />
    <p className={styles.title}>{MESSAGES.dashboard.genrePieChart}</p>
  </div>
);

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

export function GenrePieChart({ data, className }: GenrePieChartProps) {
  const cardClassName = [styles.card, className].filter(Boolean).join(' ');

  if (data.length === 0) {
    return (
      <Card className={cardClassName}>
        {header}
        <p className={styles.empty}>{MESSAGES.dashboard.noData}</p>
      </Card>
    );
  }

  // El color viaja con el dato para que quesito y leyenda no puedan desincronizarse.
  const slices = data.map((d, i) => ({
    name: d.genre,
    value: d.count,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));

  return (
    <Card className={cardClassName}>
      {header}
      <div className={styles.body}>
        <div className={styles.chart}>
          {/* Radios en % para que el donut se adapte a la caja: ancha en móvil, estrecha en tablet+ */}
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="72%"
                innerRadius="36%"
              >
                {slices.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                itemStyle={{ color: 'var(--color-text)' }}
                labelStyle={{ color: 'var(--color-text-muted)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className={styles.legend}>
          {slices.map((s) => (
            <li key={s.name} className={styles.legendItem}>
              <span className={styles.swatch} style={{ background: s.color }} aria-hidden="true" />
              <span className={styles.legendName} title={s.name}>{s.name}</span>
              <span className={styles.legendValue}>{s.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

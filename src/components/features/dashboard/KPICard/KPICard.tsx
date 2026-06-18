import type { CSSProperties, ReactNode } from 'react';
import { Card } from '@/components/ui';
import styles from './KPICard.module.scss';

interface KPICardProps {
  label: string;
  value: number;
  detail?: string;
  icon?: ReactNode;
  /** Color de acento del icono (CSS color o var). Por defecto var(--color-primary). */
  accent?: string;
}

export function KPICard({ label, value, detail, icon, accent }: KPICardProps) {
  const accentStyle = accent ? ({ '--kpi-accent': accent } as CSSProperties) : undefined;

  return (
    <Card className={styles.card} style={accentStyle}>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <div className={styles.body}>
        <p className={styles.label}>{label}</p>
        <p className={styles.value}>{value}</p>
        {detail && <p className={styles.detail}>{detail}</p>}
      </div>
    </Card>
  );
}

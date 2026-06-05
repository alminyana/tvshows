import { Card } from '@/components/ui';
import styles from './KPICard.module.scss';

interface KPICardProps {
  label: string;
  value: number;
  detail?: string;
}

export function KPICard({ label, value, detail }: KPICardProps) {
  return (
    <Card className={styles.card}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      {detail && <p className={styles.detail}>{detail}</p>}
    </Card>
  );
}

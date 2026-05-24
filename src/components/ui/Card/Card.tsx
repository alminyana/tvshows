import type { HTMLAttributes } from 'react';
import styles from './Card.module.scss';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export function Card({ padding = 'md', hoverable = false, className, children, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={[
        styles.card,
        styles[`padding-${padding}`],
        hoverable ? styles.hoverable : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './IconButton.module.scss';

type IconButtonVariant = 'default' | 'ghost' | 'danger';
type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

export function IconButton({
  icon,
  label,
  variant = 'default',
  size = 'md',
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      {...rest}
      aria-label={label}
      className={[styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ')}
    >
      {icon}
    </button>
  );
}

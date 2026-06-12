import { useState } from 'react';
import { MESSAGES } from '@/constants';
import styles from './Collapsible.module.scss';

interface Props {
  header: string;
  activeCount?: number;
  children: React.ReactNode;
}

export function Collapsible({ header, activeCount = 0, children }: Props) {
  const [expanded, setExpanded] = useState(false);

  const label = activeCount > 0
    ? MESSAGES.filters.titleWithCount(activeCount)
    : header;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setExpanded((prev) => !prev);
    }
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.header}
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
        onKeyDown={handleKeyDown}
      >
        <span className={styles.label}>{label}</span>
        <span className={`${styles.chevron} ${expanded ? styles.chevronOpen : ''}`} aria-hidden="true">
          ▾
        </span>
      </button>
      <div
        className={`${styles.content} ${expanded ? styles.contentOpen : ''}`}
        aria-hidden={!expanded}
      >
        <div className={styles.inner}>{children}</div>
      </div>
    </div>
  );
}

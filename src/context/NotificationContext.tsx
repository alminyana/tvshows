import { useState, useCallback, useRef, type ReactNode } from 'react';
import { NotificationContext } from './notificationContextInstance';
import styles from './NotificationContext.module.scss';

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((msg: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(msg);
    timerRef.current = setTimeout(() => setMessage(null), 4000);
  }, []);

  return (
    <NotificationContext value={{ notify }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={`${styles.banner} ${message ? styles.visible : ''}`}
      >
        {message}
      </div>
    </NotificationContext>
  );
}

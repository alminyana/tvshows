import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { MESSAGES } from '@/constants';
import styles from './NotFoundPage.module.scss';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <p className={styles.code} aria-hidden="true">404</p>
      <h1 className={styles.title}>{MESSAGES.notFound.title}</h1>
      <p className={styles.detail}>{MESSAGES.notFound.detail}</p>
      <Button variant="primary" onClick={() => navigate('/series')}>
        {MESSAGES.notFound.goHome}
      </Button>
    </main>
  );
}

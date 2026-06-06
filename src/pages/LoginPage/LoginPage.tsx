import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from '@/components/features/LoginForm/LoginForm';
import { MESSAGES } from '@/constants';
import styles from './LoginPage.module.scss';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/series';

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{MESSAGES.login.title}</h1>
        <LoginForm onSuccess={() => navigate(from, { replace: true })} />
      </div>
    </main>
  );
}

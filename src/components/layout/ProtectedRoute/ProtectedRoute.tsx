import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Spinner } from '@/components/ui';
import styles from './ProtectedRoute.module.scss';

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" />
      </div>
    );
  }

  // Solo hay un rol: basta con tener sesión. El listado es público, así que es el destino natural.
  if (!user) {
    return <Navigate to="/series" replace />;
  }

  return <Outlet />;
}

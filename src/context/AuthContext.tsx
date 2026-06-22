import { useEffect, useState } from 'react';
import { authService } from '@/services';
import type { User } from '@/types';
import { AuthContext } from './authContextInstance';

export { AuthContext } from './authContextInstance';
export type { AuthContextValue } from './authContextInstance';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });

    // En modo Supabase reacciona a cambios de sesión (token refresh, otra pestaña).
    // En modo mock, subscribe devuelve un noop.
    const unsubscribe = authService.subscribe((u) => {
      setUser(u);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const loggedUser = await authService.login(email, password);
    setUser(loggedUser);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext value={{ user, loading, login, logout }}>
      {children}
    </AuthContext>
  );
}

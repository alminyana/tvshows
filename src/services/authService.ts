import { db } from '../db/database';
import { hashPassword } from '../utils/hashPassword';
import type { User } from '../types/user';

const SESSION_KEY = 'tv-shows:session';

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const user = await db.users.where('email').equals(email).first();
    if (!user) throw new Error('Credenciales incorrectas');
    const hash = await hashPassword(password);
    if (hash !== user.password) throw new Error('Credenciales incorrectas');
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
    return user;
  },

  async logout(): Promise<void> {
    localStorage.removeItem(SESSION_KEY);
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscribe(_callback: (user: User | null) => void): () => void {
    return () => {};
  },

  async getCurrentUser(): Promise<User | null> {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      const { userId } = JSON.parse(raw) as { userId: string };
      const user = await db.users.get(userId);
      return user ?? null;
    } catch {
      return null;
    }
  },
};

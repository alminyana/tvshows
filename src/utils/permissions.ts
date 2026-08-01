import type { User } from '@/types/user';

// Solo hay un rol con sesión (admin): poder escribir equivale a estar logueado.
export function canCreateSeries(user: User | null): boolean {
  return user !== null;
}

export function canEditSeries(user: User | null): boolean {
  return user !== null;
}

export function canDeleteSeries(user: User | null): boolean {
  return canEditSeries(user);
}

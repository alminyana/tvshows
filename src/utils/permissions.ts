import type { User } from '@/types/user';

export function canCreateSeries(user: User | null): boolean {
  return user?.role === 'admin';
}

export function canEditSeries(user: User | null): boolean {
  return user?.role === 'admin';
}

export function canDeleteSeries(user: User | null): boolean {
  return canEditSeries(user);
}

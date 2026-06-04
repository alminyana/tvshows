import type { User } from '@/types/user';
import type { Series } from '@/types/series';

export function canCreateSeries(user: User | null): boolean {
  return user?.role === 'user' || user?.role === 'admin';
}

export function canEditSeries(user: User | null, series: Series): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return user.role === 'user' && series.createdBy === user.id;
}

export function canDeleteSeries(user: User | null, series: Series): boolean {
  return canEditSeries(user, series);
}

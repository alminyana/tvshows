import { describe, it, expect } from 'vitest';
import { canCreateSeries, canEditSeries, canDeleteSeries } from './permissions';
import type { User } from '@/types/user';

const makeUser = (id: string, role: 'admin' | 'user'): User => ({
  id,
  email: `${id}@test.com`,
  password: 'h',
  role,
  createdAt: '',
});

describe('canCreateSeries', () => {
  it('Viewer (null) → false', () => expect(canCreateSeries(null)).toBe(false));
  it('user → false', () => expect(canCreateSeries(makeUser('u1', 'user'))).toBe(false));
  it('admin → true', () => expect(canCreateSeries(makeUser('a1', 'admin'))).toBe(true));
});

describe('canEditSeries', () => {
  it('Viewer (null) → false', () => expect(canEditSeries(null)).toBe(false));
  it('user → false', () => expect(canEditSeries(makeUser('u1', 'user'))).toBe(false));
  it('admin → true', () => expect(canEditSeries(makeUser('a1', 'admin'))).toBe(true));
});

describe('canDeleteSeries', () => {
  it('delega en canEditSeries: user → false', () => {
    expect(canDeleteSeries(makeUser('u1', 'user'))).toBe(false);
  });

  it('admin → true', () => expect(canDeleteSeries(makeUser('a1', 'admin'))).toBe(true));
});

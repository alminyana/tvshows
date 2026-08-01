import { describe, it, expect } from 'vitest';
import { canCreateSeries, canEditSeries, canDeleteSeries } from './permissions';
import type { User } from '@/types/user';

const admin: User = {
  id: 'a1',
  email: 'a1@test.com',
  password: 'h',
  role: 'admin',
  createdAt: '',
};

describe('canCreateSeries', () => {
  it('sin sesión → false', () => expect(canCreateSeries(null)).toBe(false));
  it('con sesión → true', () => expect(canCreateSeries(admin)).toBe(true));
});

describe('canEditSeries', () => {
  it('sin sesión → false', () => expect(canEditSeries(null)).toBe(false));
  it('con sesión → true', () => expect(canEditSeries(admin)).toBe(true));
});

describe('canDeleteSeries', () => {
  it('sin sesión → false', () => expect(canDeleteSeries(null)).toBe(false));
  it('con sesión → true', () => expect(canDeleteSeries(admin)).toBe(true));
});

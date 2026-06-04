import { describe, it, expect } from 'vitest';
import { canCreateSeries, canEditSeries, canDeleteSeries } from './permissions';
import type { User } from '@/types/user';
import type { Series } from '@/types/series';

const makeUser = (id: string, role: 'admin' | 'user'): User => ({
  id,
  email: `${id}@test.com`,
  password: 'h',
  role,
  createdAt: '',
});

const makeSeries = (createdBy: string): Series => ({
  id: 's1',
  title: 'Serie',
  synopsis: 'Synopsis',
  seasons: 1,
  cast: [],
  year: 2020,
  rating: 3,
  genres: ['Drama'],
  coverImage: 'img-1',
  createdBy,
  createdAt: '',
  updatedAt: '',
});

describe('canCreateSeries', () => {
  it('Viewer (null) → false', () => expect(canCreateSeries(null)).toBe(false));
  it('user → true', () => expect(canCreateSeries(makeUser('u1', 'user'))).toBe(true));
  it('admin → true', () => expect(canCreateSeries(makeUser('a1', 'admin'))).toBe(true));
});

describe('canEditSeries', () => {
  it('Viewer (null) → false', () => {
    expect(canEditSeries(null, makeSeries('u1'))).toBe(false);
  });

  it('user dueño → true', () => {
    expect(canEditSeries(makeUser('u1', 'user'), makeSeries('u1'))).toBe(true);
  });

  it('user no dueño → false', () => {
    expect(canEditSeries(makeUser('u2', 'user'), makeSeries('u1'))).toBe(false);
  });

  it('admin → true sin importar el creador', () => {
    expect(canEditSeries(makeUser('a1', 'admin'), makeSeries('u1'))).toBe(true);
  });
});

describe('canDeleteSeries', () => {
  it('delega en canEditSeries: user dueño → true', () => {
    expect(canDeleteSeries(makeUser('u1', 'user'), makeSeries('u1'))).toBe(true);
  });

  it('delega en canEditSeries: user no dueño → false', () => {
    expect(canDeleteSeries(makeUser('u2', 'user'), makeSeries('u1'))).toBe(false);
  });

  it('admin → true', () => {
    expect(canDeleteSeries(makeUser('a1', 'admin'), makeSeries('u1'))).toBe(true);
  });
});

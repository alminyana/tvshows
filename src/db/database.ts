import Dexie, { type EntityTable } from 'dexie';
import type { Series } from '../types/series';
import type { User } from '../types/user';

interface ImageRecord {
  id: string;
  blob: Blob;
}

export class AppDatabase extends Dexie {
  series!: EntityTable<Series, 'id'>;
  users!: EntityTable<User, 'id'>;
  images!: EntityTable<ImageRecord, 'id'>;

  constructor() {
    super('tv-shows');
    this.version(1).stores({
      series: 'id, title, rating, createdBy, createdAt',
      users: 'id, &email, role',
      images: 'id',
    });
  }
}

export const db = new AppDatabase();

import Dexie, { type EntityTable } from 'dexie';
import type { Series } from '../types/series';
import type { User } from '../types/user';
import { migrateSeasons } from '../utils/migrateSeasons';

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

    // v2: `Series.seasons` pasó de number (recuento) a string (texto libre) en H9.
    // El schema no cambia; solo se normalizan los registros legacy ya persistidos.
    this.version(2).upgrade((tx) =>
      tx
        .table('series')
        .toCollection()
        .modify((series: { seasons: unknown }) => {
          series.seasons = migrateSeasons(series.seasons);
        }),
    );
  }
}

export const db = new AppDatabase();

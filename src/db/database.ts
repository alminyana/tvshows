import Dexie from 'dexie';

export class AppDatabase extends Dexie {
  constructor() {
    super('tv-shows');
    // Schemas reales se definirán al implementar features.
  }
}

export const db = new AppDatabase();

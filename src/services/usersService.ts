import { db } from '../db/database';
import type { User } from '../types/user';

export const usersService = {
  async getAll(): Promise<User[]> {
    return db.users.toArray();
  },

  async getById(id: string): Promise<User | undefined> {
    return db.users.get(id);
  },
};

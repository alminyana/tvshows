import { db } from '../db/database';
import { hashPassword } from '../utils/hashPassword';
import type { User, Role } from '../types/user';

export const usersService = {
  async getAll(): Promise<User[]> {
    return db.users.toArray();
  },

  async getById(id: string): Promise<User | undefined> {
    return db.users.get(id);
  },

  async create(data: { email: string; password: string; role: Role }): Promise<User> {
    const existing = await db.users.where('email').equals(data.email).first();
    if (existing) throw new Error('El email ya está en uso.');
    const user: User = {
      id: crypto.randomUUID(),
      email: data.email,
      password: await hashPassword(data.password),
      role: data.role,
      createdAt: new Date().toISOString(),
    };
    await db.users.add(user);
    return user;
  },

  async update(
    id: string,
    data: { email?: string; password?: string; role?: Role }
  ): Promise<User> {
    const existing = await db.users.get(id);
    if (!existing) throw new Error(`Usuario no encontrado: ${id}`);
    if (data.email && data.email !== existing.email) {
      const taken = await db.users.where('email').equals(data.email).first();
      if (taken) throw new Error('El email ya está en uso.');
    }
    const updated: User = {
      ...existing,
      email: data.email ?? existing.email,
      role: data.role ?? existing.role,
      password: data.password ? await hashPassword(data.password) : existing.password,
    };
    await db.users.put(updated);
    return updated;
  },

  async remove(id: string, currentUserId: string): Promise<void> {
    if (id === currentUserId) throw new Error('No puedes eliminar tu propia cuenta.');
    await db.users.delete(id);
  },
};

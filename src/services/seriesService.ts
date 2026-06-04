import { db } from '../db/database';
import type { Series } from '../types/series';

export const seriesService = {
  async getAll(): Promise<Series[]> {
    return db.series.toArray();
  },

  async getById(id: string): Promise<Series | undefined> {
    return db.series.get(id);
  },

  async create(data: Omit<Series, 'id' | 'createdAt' | 'updatedAt'>): Promise<Series> {
    const now = new Date().toISOString();
    const series: Series = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    await db.series.add(series);
    return series;
  },

  async update(id: string, data: Partial<Omit<Series, 'id' | 'createdAt'>>): Promise<Series> {
    const existing = await db.series.get(id);
    if (!existing) throw new Error(`Serie no encontrada: ${id}`);
    const updated: Series = { ...existing, ...data, updatedAt: new Date().toISOString() };
    await db.series.put(updated);
    return updated;
  },

  async remove(id: string): Promise<void> {
    await db.series.delete(id);
  },
};

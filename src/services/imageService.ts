import { db } from '../db/database';

export const imageService = {
  async save(blob: Blob): Promise<string> {
    const id = crypto.randomUUID();
    await db.images.add({ id, blob });
    return id;
  },

  async get(id: string): Promise<Blob | undefined> {
    const record = await db.images.get(id);
    return record?.blob;
  },

  async remove(id: string): Promise<void> {
    await db.images.delete(id);
  },

  async getSrc(id: string): Promise<string | undefined> {
    if (!id) return undefined;
    const blob = await this.get(id);
    return blob ? URL.createObjectURL(blob) : undefined;
  },
};

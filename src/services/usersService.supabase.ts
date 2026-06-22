import { supabase } from '@/lib/supabase';
import type { User, Role } from '@/types/user';
import type { IUsersService } from './types';
import { mapDbRowToUser } from './mappers/userMapper';

export const usersServiceSupabase: IUsersService = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapDbRowToUser);
  },

  async getById(id: string): Promise<User | undefined> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }
    return data ? mapDbRowToUser(data) : undefined;
  },

  // create/update/remove requieren service_role (Admin API de Supabase Auth).
  // Se implementan en F4 mediante Edge Function admin-create-user.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create(_data: { email: string; password: string; role: Role }): Promise<User> {
    throw new Error('usersService.create no disponible en modo Supabase hasta F4.');
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(_id: string, _data: { email?: string; password?: string; role?: Role }): Promise<User> {
    throw new Error('usersService.update no disponible en modo Supabase hasta F4.');
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove(_id: string, _currentUserId: string): Promise<void> {
    throw new Error('usersService.remove no disponible en modo Supabase hasta F4.');
  },
};

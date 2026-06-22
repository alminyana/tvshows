import { supabase } from '@/lib/supabase';
import type { User } from '@/types/user';
import type { IAuthService } from './types';
import { mapDbRowToUser } from './mappers/userMapper';

async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return mapDbRowToUser(data);
}

export const authServiceSupabase: IAuthService = {
  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const profile = await fetchProfile(data.user.id);
    if (!profile) throw new Error('Perfil de usuario no encontrado.');
    return profile;
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return null;
    return fetchProfile(session.user.id);
  },

  subscribe(callback: (user: User | null) => void): () => void {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        callback(null);
        return;
      }
      const profile = await fetchProfile(session.user.id);
      callback(profile);
    });
    return () => subscription.unsubscribe();
  },
};

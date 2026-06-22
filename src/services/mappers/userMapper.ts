import type { User, Role } from '@/types/user';

interface ProfileDbRow {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export function mapDbRowToUser(row: ProfileDbRow): User {
  return {
    id: row.id,
    email: row.email,
    role: row.role as Role,
    // password no se almacena en profiles; placeholder hasta F4
    password: '',
    createdAt: row.created_at,
  };
}

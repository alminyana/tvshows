export type Role = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  password: string;
  role: Role;
  createdAt: string;
}

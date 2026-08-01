// Único rol con sesión: el visitante sin login es la ausencia de usuario.
export type Role = 'admin';

export interface User {
  id: string;
  email: string;
  password: string;
  role: Role;
  createdAt: string;
}

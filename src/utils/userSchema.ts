import { z } from 'zod';

export const userCreateSchema = z.object({
  email: z.string().email('Email no válido.'),
  password: z.string().min(6, 'Mínimo 6 caracteres.'),
  role: z.enum(['admin', 'user']),
});

export const userEditSchema = z.object({
  email: z.string().email('Email no válido.'),
  password: z
    .string()
    .refine((v) => v === '' || v.length >= 6, { message: 'Mínimo 6 caracteres.' }),
  role: z.enum(['admin', 'user']),
});

export type UserFormValues = {
  email: string;
  password: string;
  role: 'admin' | 'user';
};

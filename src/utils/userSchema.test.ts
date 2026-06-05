import { describe, it, expect } from 'vitest';
import { userCreateSchema, userEditSchema } from './userSchema';

describe('userCreateSchema', () => {
  it('acepta datos válidos', () => {
    const result = userCreateSchema.safeParse({
      email: 'user@example.com',
      password: 'abc123',
      role: 'user',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza email inválido', () => {
    const result = userCreateSchema.safeParse({
      email: 'no-es-email',
      password: 'abc123',
      role: 'user',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Email no válido.');
  });

  it('rechaza password con menos de 6 caracteres', () => {
    const result = userCreateSchema.safeParse({
      email: 'user@example.com',
      password: '123',
      role: 'user',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Mínimo 6 caracteres.');
  });

  it('rechaza password vacío', () => {
    const result = userCreateSchema.safeParse({
      email: 'user@example.com',
      password: '',
      role: 'user',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza role inválido', () => {
    const result = userCreateSchema.safeParse({
      email: 'user@example.com',
      password: 'abc123',
      role: 'viewer',
    });
    expect(result.success).toBe(false);
  });

  it('acepta role admin', () => {
    const result = userCreateSchema.safeParse({
      email: 'admin@example.com',
      password: 'abc123',
      role: 'admin',
    });
    expect(result.success).toBe(true);
  });
});

describe('userEditSchema', () => {
  it('acepta password vacío (sin cambio)', () => {
    const result = userEditSchema.safeParse({
      email: 'user@example.com',
      password: '',
      role: 'user',
    });
    expect(result.success).toBe(true);
  });

  it('acepta password válido de 6+ caracteres', () => {
    const result = userEditSchema.safeParse({
      email: 'user@example.com',
      password: 'nuevapass',
      role: 'user',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza password con 1-5 caracteres', () => {
    const result = userEditSchema.safeParse({
      email: 'user@example.com',
      password: '123',
      role: 'user',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Mínimo 6 caracteres.');
  });

  it('rechaza email inválido', () => {
    const result = userEditSchema.safeParse({
      email: 'malo',
      password: '',
      role: 'user',
    });
    expect(result.success).toBe(false);
  });
});

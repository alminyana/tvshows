import { describe, it, expect } from 'vitest';
import { hashPassword } from './hashPassword';

describe('hashPassword', () => {
  it('produce un hash hexadecimal de 64 caracteres', async () => {
    const hash = await hashPassword('test123');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it('es determinista — mismo input produce mismo hash', async () => {
    const a = await hashPassword('misma-clave');
    const b = await hashPassword('misma-clave');
    expect(a).toBe(b);
  });

  it('inputs distintos producen hashes distintos', async () => {
    const a = await hashPassword('clave-a');
    const b = await hashPassword('clave-b');
    expect(a).not.toBe(b);
  });
});

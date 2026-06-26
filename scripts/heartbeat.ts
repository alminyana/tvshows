/**
 * Heartbeat anti-pausa: actualiza la fila única de `heartbeat` con un upsert.
 * Pensado para correr desde una GitHub Action programada (cada 3 días) y así
 * generar actividad real de BD que evite la pausa del free tier de Supabase.
 *
 * Usa service_role: la tabla `heartbeat` tiene RLS activa y sin políticas de
 * escritura, así que solo esta credencial (que salta RLS) puede escribirla.
 *
 * Ejecutar con: pnpm tsx --env-file=.env.local scripts/heartbeat.ts
 */
import { createClient } from '@supabase/supabase-js';

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Variable de entorno requerida: ${name}`);
  return val;
}

const SUPABASE_URL = requireEnv('VITE_SUPABASE_URL');
const SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main(): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('heartbeat')
    .upsert({ id: 1, last_ping: now });

  if (error) {
    console.error(`✗ Heartbeat falló: ${error.message}`);
    process.exit(1);
  }

  console.log(`✓ Heartbeat OK: last_ping = ${now}`);
}

main();

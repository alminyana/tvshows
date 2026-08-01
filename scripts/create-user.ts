/**
 * Crea un usuario en Supabase Auth + su fila en profiles (siempre admin,
 * el único rol que existe).
 * Uso: ver scripts/README.md
 * Ejecutar con: pnpm tsx --env-file=.env.local scripts/create-user.ts <email> <password>
 */
import { createClient } from '@supabase/supabase-js';

// ── Env ──────────────────────────────────────────────────────────────────────

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Variable de entorno requerida: ${name}`);
  return val;
}

const SUPABASE_URL = requireEnv('VITE_SUPABASE_URL');
const SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

// ── Argumentos ───────────────────────────────────────────────────────────────

const [email, password] = process.argv.slice(2);

if (!email || !password) {
  console.error('Uso: pnpm tsx scripts/create-user.ts <email> <password>');
  process.exit(1);
}

const role = 'admin';

// ── Cliente Supabase (service_role) ──────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Idempotente: si el perfil ya existe, no se recrea.
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    console.log(`↩ Usuario ya existe: ${email} (${existing.id})`);
    return;
  }

  // Usuario nuevo. email_confirm: true porque la confirmación por email está
  // desactivada en Fase 1; sin esto el usuario no podría iniciar sesión.
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`Error creando usuario ${email}: ${error.message}`);

  const uid = data.user.id;

  // El trigger handle_new_user puede haber creado ya el perfil; el upsert
  // deja la fila consistente sin importar el orden.
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: uid, email, role });
  if (profileError) throw new Error(`Error creando perfil ${email}: ${profileError.message}`);

  console.log(`✓ Usuario creado: ${email} (${uid})`);
}

main().catch((err) => {
  console.error('\n✗ Error:', err instanceof Error ? err.message : err);
  process.exit(1);
});

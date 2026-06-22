/**
 * Script de migración: IndexedDB export → Supabase.
 * Uso: ver scripts/README.md
 * Ejecutar con: pnpm tsx --env-file=.env.local scripts/migrate-to-supabase.ts <ruta-al-export.json>
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { dataUrlToUint8Array, mimeToExt } from './utils.ts';

// ── Tipos ────────────────────────────────────────────────────────────────────

interface ExportSeries {
  id: string;
  title: string;
  synopsis: string;
  seasons: string;
  year: number;
  rating: number;
  opinion?: string;
  genres: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  coverImageBase64: string | null;
  coverMime: string | null;
}

interface ExportFile {
  series: ExportSeries[];
}

interface UserDef {
  email: string;
  password: string;
  role: 'admin' | 'user';
}

// ── Env ──────────────────────────────────────────────────────────────────────

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Variable de entorno requerida: ${name}`);
  return val;
}

const SUPABASE_URL = requireEnv('VITE_SUPABASE_URL');
const SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
const ADMIN_EMAIL = requireEnv('ADMIN_EMAIL');
const ADMIN_PASSWORD = requireEnv('ADMIN_PASSWORD');
const USER_EMAIL = requireEnv('USER_EMAIL');
const USER_PASSWORD = requireEnv('USER_PASSWORD');

const EXPORT_PATH = process.argv[2];
if (!EXPORT_PATH) {
  console.error('Uso: pnpm tsx scripts/migrate-to-supabase.ts <ruta-al-export.json>');
  process.exit(1);
}

// ── Cliente Supabase (service_role) ──────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

async function createUsers(users: UserDef[]): Promise<Map<'admin' | 'user', string>> {
  const uidMap = new Map<'admin' | 'user', string>();

  for (const u of users) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', u.email)
      .maybeSingle();

    if (existing) {
      console.log(`  ↩ Usuario ya existe: ${u.email} (${existing.id})`);
      uidMap.set(u.role, existing.id as string);
      continue;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
    });
    if (error) throw new Error(`Error creando usuario ${u.email}: ${error.message}`);

    const uid = data.user.id;

    // El trigger handle_new_user puede haber creado ya el perfil; upsert para
    // garantizar que el role queda correcto independientemente del orden.
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: uid,
      email: u.email,
      role: u.role,
    });
    if (profileError) throw new Error(`Error creando perfil ${u.email}: ${profileError.message}`);

    console.log(`  ✓ Usuario creado: ${u.email} (${uid})`);
    uidMap.set(u.role, uid);
  }

  return uidMap;
}

async function upsertGenres(names: string[]): Promise<Map<string, string>> {
  const idMap = new Map<string, string>();

  for (const name of names) {
    const { data, error } = await supabase
      .from('genres')
      .upsert({ name }, { onConflict: 'id', ignoreDuplicates: false })
      .select('id, name')
      .maybeSingle();

    if (error) {
      // El índice único es sobre lower(name), no hay onConflict directo con expresión.
      // Si falla, buscamos el existente.
      const { data: existing, error: fetchError } = await supabase
        .from('genres')
        .select('id, name')
        .ilike('name', name)
        .maybeSingle();
      if (fetchError || !existing) throw new Error(`Error con género "${name}": ${error.message}`);
      idMap.set(existing.name as string, existing.id as string);
    } else if (data) {
      idMap.set(data.name as string, data.id as string);
    }
  }

  return idMap;
}

async function uploadCover(
  seriesId: string,
  base64: string,
  mime: string,
): Promise<string | null> {
  const converted = dataUrlToUint8Array(`data:${mime};base64,${base64}`);
  if (!converted) return null;

  const ext = mimeToExt(mime);
  const path = `${seriesId}.${ext}`;

  const { error } = await supabase.storage
    .from('covers')
    .upload(path, converted.data, { contentType: mime, upsert: true });

  if (error) {
    console.warn(`  ⚠ No se pudo subir portada de ${seriesId}: ${error.message}`);
    return null;
  }

  return path;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n=== Migración a Supabase ===\n');

  // 1. Leer export
  const raw = readFileSync(EXPORT_PATH, 'utf-8');
  const exportData = JSON.parse(raw) as ExportFile;
  console.log(`Leídas ${exportData.series.length} series de ${EXPORT_PATH}\n`);

  // 2. Crear usuarios
  console.log('── Usuarios ──');
  const users: UserDef[] = [
    { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' },
    { email: USER_EMAIL, password: USER_PASSWORD, role: 'user' },
  ];
  const uidMap = await createUsers(users);
  const adminUid = uidMap.get('admin');
  if (!adminUid) throw new Error('No se pudo obtener el UID del admin');
  console.log();

  // 3. Recopilar todos los géneros únicos
  const allGenreNames = [
    ...new Set(
      exportData.series.flatMap((s) => s.genres).map((g) => g.trim()).filter(Boolean),
    ),
  ];
  console.log(`── Géneros (${allGenreNames.length}) ──`);
  const genreIdMap = await upsertGenres(allGenreNames);
  console.log(`  ✓ ${genreIdMap.size} géneros sincronizados\n`);

  // 4. Migrar series
  console.log('── Series ──');
  let inserted = 0;
  let skipped = 0;
  let coversFailed = 0;

  for (const s of exportData.series) {
    // Verificar si ya existe
    const { data: existing } = await supabase
      .from('series')
      .select('id')
      .eq('id', s.id)
      .maybeSingle();

    if (existing) {
      console.log(`  ↩ Ya existe: ${s.title}`);
      skipped++;
      continue;
    }

    // Subir portada
    let coverImagePath: string | null = null;
    if (s.coverImageBase64 && s.coverMime) {
      coverImagePath = await uploadCover(s.id, s.coverImageBase64, s.coverMime);
      if (!coverImagePath) coversFailed++;
    }

    // Insertar serie
    const { error: seriesError } = await supabase.from('series').insert({
      id: s.id,
      title: s.title,
      synopsis: s.synopsis,
      seasons: s.seasons,
      year: s.year,
      rating: s.rating,
      opinion: s.opinion ?? null,
      cover_image_path: coverImagePath,
      created_by: adminUid,
      created_at: s.createdAt,
      updated_at: s.updatedAt,
    });
    if (seriesError) throw new Error(`Error insertando "${s.title}": ${seriesError.message}`);

    // Insertar géneros puente
    const genreRows = s.genres
      .map((name) => {
        const gid = genreIdMap.get(name);
        return gid ? { series_id: s.id, genre_id: gid } : null;
      })
      .filter((r): r is { series_id: string; genre_id: string } => r !== null);

    if (genreRows.length > 0) {
      const { error: sgError } = await supabase.from('series_genres').insert(genreRows);
      if (sgError) throw new Error(`Error en series_genres de "${s.title}": ${sgError.message}`);
    }

    console.log(`  ✓ ${s.title}${coverImagePath ? ' (portada subida)' : ''}`);
    inserted++;
  }

  // 5. Resumen
  console.log('\n=== Resumen ===');
  console.log(`  Series insertadas : ${inserted}`);
  console.log(`  Series omitidas   : ${skipped}`);
  console.log(`  Portadas fallidas : ${coversFailed}`);
  console.log(`  Géneros           : ${genreIdMap.size}`);
  console.log('');
}

main().catch((err) => {
  console.error('\n✗ Error:', err instanceof Error ? err.message : err);
  process.exit(1);
});

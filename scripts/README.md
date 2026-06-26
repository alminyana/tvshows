# Scripts de migración

## migrate-to-supabase.ts

Importa las series exportadas desde IndexedDB a Supabase.

### Prerrequisitos

- F1 aplicada (schema + RLS + bucket `covers`).
- JSON de export generado desde la app en `/export` (DEV).

### Variables de entorno

Añade en `.env.local` (o expórtala en la shell):

```
VITE_SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
ADMIN_EMAIL=tu-email-admin@ejemplo.com
ADMIN_PASSWORD=contraseña-segura-admin
USER_EMAIL=tu-email-user@ejemplo.com
USER_PASSWORD=contraseña-segura-user
```

### Ejecución

```bash
pnpm tsx --env-file=.env.local scripts/migrate-to-supabase.ts ~/Downloads/tvshows-export.json
```

El script es **idempotente**: si un usuario o serie ya existe, lo omite sin error.

### Salida esperada

```
=== Migración a Supabase ===

── Usuarios ──
  ✓ Usuario creado: admin@ejemplo.com (uuid...)
  ✓ Usuario creado: user@ejemplo.com (uuid...)

── Géneros (10) ──
  ✓ 10 géneros sincronizados

── Series ──
  ✓ Breaking Bad (portada subida)
  ✓ The Wire (portada subida)
  ...

=== Resumen ===
  Series insertadas : 16
  Series omitidas   : 0
  Portadas fallidas : 0
  Géneros           : 10
```

### Verificación

Tras ejecutar, comprueba en el dashboard de Supabase:
- Table Editor → `series`, `genres`, `series_genres`, `profiles`
- Storage → bucket `covers`

## heartbeat.ts

Actualiza la fila única de la tabla `heartbeat` con un `upsert`. Genera
actividad real de BD para evitar la pausa del free tier de Supabase por
inactividad. Lo dispara la GitHub Action `.github/workflows/heartbeat.yml`
(cada 3 días), pero se puede ejecutar a mano:

```bash
pnpm tsx --env-file=.env.local scripts/heartbeat.ts
```

### Variables / secrets

Usa `VITE_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` (la tabla `heartbeat`
tiene RLS sin políticas de escritura; solo el `service_role` la escribe).

Para que la Action funcione, añade ambos como **secrets del repo** en
GitHub → Settings → Secrets and variables → Actions:

```
VITE_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

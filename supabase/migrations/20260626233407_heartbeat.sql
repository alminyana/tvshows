-- ============================================================
-- heartbeat: una sola fila que un cron actualiza periódicamente
-- para evitar la pausa del free tier por inactividad.
-- Sin políticas RLS: solo el service_role (que salta RLS) la
-- lee/escribe; el cliente público no la toca.
-- ============================================================
create table public.heartbeat (
  id        smallint    primary key default 1 check (id = 1),
  last_ping timestamptz not null default now()
);

insert into public.heartbeat (id) values (1) on conflict do nothing;

alter table public.heartbeat enable row level security;

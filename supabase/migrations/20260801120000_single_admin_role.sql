-- ============================================================
-- Un solo rol: se retira 'user'.
-- El visitante sin sesión (lectura pública vía RLS) sustituye a
-- lo que antes era el rol 'user', que no aportaba permisos
-- propios. Todo perfil con sesión es admin.
-- is_admin() y las políticas RLS existentes siguen siendo
-- válidas: ahora las satisface cualquier perfil.
-- ============================================================

update public.profiles set role = 'admin' where role <> 'admin';

alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role = 'admin');
alter table public.profiles alter column role set default 'admin';

-- El trigger de alta dejaba los perfiles nuevos en 'user', que ya no existe.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'admin');
  return new;
end;
$$;

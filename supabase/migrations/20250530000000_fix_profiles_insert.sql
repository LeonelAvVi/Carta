-- Perfil: permitir INSERT + backfill de usuarios existentes sin profile

grant insert on table public.profiles to authenticated;

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

-- Usuarios registrados antes del trigger no tienen fila en profiles
insert into public.profiles (id, full_name, email)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
  u.email
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);

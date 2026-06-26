-- Fix: dueño puede buscar perfiles por email al agregar empleados (sin RPC)

drop policy if exists profiles_select_owner_invite on public.profiles;
create policy profiles_select_owner_invite
  on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.restaurants r
      where r.owner_id = (select auth.uid())
    )
  );

-- Asegurar función RPC por si se usa en otros lugares
create or replace function public.find_profile_id_by_email(p_email text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
begin
  if (select auth.uid()) is null then
    return null;
  end if;

  if not exists (
    select 1 from public.restaurants r
    where r.owner_id = (select auth.uid())
  ) then
    return null;
  end if;

  select p.id into v_profile_id
  from public.profiles p
  where lower(trim(p.email)) = lower(trim(p_email))
  limit 1;

  return v_profile_id;
end;
$$;

revoke all on function public.find_profile_id_by_email(text) from public;
grant execute on function public.find_profile_id_by_email(text) to authenticated;

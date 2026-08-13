-- Llamado al mesero / pedir la cuenta (señal en la mesa, no es estado de pedido)

alter table public.tables
  add column if not exists assistance_kind text,
  add column if not exists assistance_requested_at timestamptz;

alter table public.tables
  drop constraint if exists tables_assistance_kind_check;

alter table public.tables
  add constraint tables_assistance_kind_check check (
    assistance_kind is null
    or assistance_kind in ('waiter', 'bill')
  );

comment on column public.tables.assistance_kind is
  'Señal activa del comensal: waiter = llamar mesero, bill = pedir la cuenta';

comment on column public.tables.assistance_requested_at is
  'Momento del último llamado de asistencia';

create or replace function public.request_table_assistance(
  p_restaurant_id uuid,
  p_table_id uuid,
  p_kind text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_restaurant_id is null or p_table_id is null then
    raise exception 'Datos incompletos';
  end if;

  if p_kind is null or p_kind not in ('waiter', 'bill') then
    raise exception 'Tipo de solicitud no válido';
  end if;

  if not exists (
    select 1
    from public.tables t
    where t.id = p_table_id
      and t.restaurant_id = p_restaurant_id
      and t.is_active = true
  ) then
    raise exception 'Mesa no válida';
  end if;

  update public.tables
  set
    assistance_kind = p_kind,
    assistance_requested_at = now()
  where id = p_table_id
    and restaurant_id = p_restaurant_id;

  return jsonb_build_object(
    'ok', true,
    'kind', p_kind,
    'table_id', p_table_id
  );
end;
$$;

revoke all on function public.request_table_assistance(uuid, uuid, text) from public;
grant execute on function public.request_table_assistance(uuid, uuid, text) to anon, authenticated;

create or replace function public.clear_table_assistance(p_table_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_restaurant_id uuid;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión';
  end if;

  if p_table_id is null then
    raise exception 'Mesa no válida';
  end if;

  select t.restaurant_id into v_restaurant_id
  from public.tables t
  where t.id = p_table_id;

  if v_restaurant_id is null then
    raise exception 'Mesa no encontrada';
  end if;

  if not (
    exists (
      select 1 from public.restaurants r
      where r.id = v_restaurant_id and r.owner_id = v_uid
    )
    or public.is_restaurant_employee(v_restaurant_id)
  ) then
    raise exception 'No tienes permiso';
  end if;

  update public.tables
  set
    assistance_kind = null,
    assistance_requested_at = null
  where id = p_table_id;

  return jsonb_build_object('ok', true, 'table_id', p_table_id);
end;
$$;

revoke all on function public.clear_table_assistance(uuid) from public;
grant execute on function public.clear_table_assistance(uuid) to authenticated;

-- Al cerrar mesa también limpia la señal de asistencia
create or replace function public.close_restaurant_table(p_table_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_restaurant_id uuid;
  v_uid uuid := auth.uid();
  v_updated int := 0;
  v_active int := 0;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión';
  end if;

  if p_table_id is null then
    raise exception 'Mesa no válida';
  end if;

  select t.restaurant_id
  into v_restaurant_id
  from public.tables t
  where t.id = p_table_id;

  if v_restaurant_id is null then
    raise exception 'Mesa no encontrada';
  end if;

  if not (
    exists (
      select 1
      from public.restaurants r
      where r.id = v_restaurant_id
        and r.owner_id = v_uid
    )
    or public.is_restaurant_employee(v_restaurant_id)
  ) then
    raise exception 'No tienes permiso para cerrar esta mesa';
  end if;

  select count(*)::int
  into v_active
  from public.orders o
  where o.table_id = p_table_id
    and o.restaurant_id = v_restaurant_id
    and o.status in ('pending', 'confirmed', 'preparing', 'ready');

  if v_active > 0 then
    raise exception
      'Hay pedidos sin entregar ni cancelar. Terminá o cancelá antes de cerrar la mesa.';
  end if;

  if not exists (
    select 1
    from public.orders o
    where o.table_id = p_table_id
      and o.restaurant_id = v_restaurant_id
      and o.status in ('delivered', 'cancelled')
  ) then
    raise exception 'No hay nada que cerrar en esta mesa.';
  end if;

  update public.orders o
  set status = 'closed'
  where o.table_id = p_table_id
    and o.restaurant_id = v_restaurant_id
    and o.status in ('delivered', 'cancelled');

  get diagnostics v_updated = row_count;

  update public.tables
  set assistance_kind = null, assistance_requested_at = null
  where id = p_table_id;

  return jsonb_build_object(
    'closed_count', v_updated,
    'table_id', p_table_id
  );
end;
$$;

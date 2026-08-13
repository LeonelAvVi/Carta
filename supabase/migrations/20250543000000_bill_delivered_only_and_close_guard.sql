-- Cuenta: solo entregados suman. Cerrar mesa: exige sin pedidos en curso.

create or replace function public.get_guest_table_order_status(
  p_restaurant_id uuid,
  p_table_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_status text;
  v_created_at timestamptz;
  v_bill_total numeric;
  v_order_count int;
  v_open_count int;
begin
  if p_restaurant_id is null or p_table_id is null then
    return null;
  end if;

  if not exists (
    select 1
    from public.tables t
    where t.id = p_table_id
      and t.restaurant_id = p_restaurant_id
      and t.is_active = true
  ) then
    return null;
  end if;

  -- Sesión abierta: pedidos en curso o ya entregados (aún no closed)
  select count(*)::int
  into v_open_count
  from public.orders o
  where o.table_id = p_table_id
    and o.restaurant_id = p_restaurant_id
    and o.status in ('pending', 'confirmed', 'preparing', 'ready', 'delivered');

  if v_open_count = 0 then
    return null;
  end if;

  -- La cuenta del comensal solo suma entregados
  select
    coalesce(sum(o.total), 0),
    count(*)::int
  into v_bill_total, v_order_count
  from public.orders o
  where o.table_id = p_table_id
    and o.restaurant_id = p_restaurant_id
    and o.status = 'delivered';

  select o.status, o.created_at
  into v_status, v_created_at
  from public.orders o
  where o.table_id = p_table_id
    and o.restaurant_id = p_restaurant_id
    and o.status in ('pending', 'confirmed', 'preparing', 'ready', 'delivered')
  order by o.created_at desc
  limit 1;

  return jsonb_build_object(
    'status', v_status,
    'created_at', v_created_at,
    'bill_total', v_bill_total,
    'order_count', v_order_count
  );
end;
$$;

comment on function public.get_guest_table_order_status(uuid, uuid) is
  'Carta pública: status del último pedido abierto + total solo de entregados.';

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

  -- Cierra entregados (cuenta) y/o cancelados (cliente se fue)
  update public.orders o
  set status = 'closed'
  where o.table_id = p_table_id
    and o.restaurant_id = v_restaurant_id
    and o.status in ('delivered', 'cancelled');

  get diagnostics v_updated = row_count;

  return jsonb_build_object(
    'closed_count', v_updated,
    'table_id', p_table_id
  );
end;
$$;

comment on function public.close_restaurant_table(uuid) is
  'Cierra mesa solo si no hay pedidos en curso; marca entregados/cancelados como closed.';

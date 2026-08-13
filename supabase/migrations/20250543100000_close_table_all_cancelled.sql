-- Permite cerrar mesa cuando todos los pedidos quedaron cancelados (cliente se fue).

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

  return jsonb_build_object(
    'closed_count', v_updated,
    'table_id', p_table_id
  );
end;
$$;

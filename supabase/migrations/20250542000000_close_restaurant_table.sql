-- Asegura estado "closed" y cierra mesa de forma confiable (dueño o empleado).

alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check check (
    status in (
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'delivered',
      'cancelled',
      'closed'
    )
  );

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

  update public.orders o
  set status = 'closed'
  where o.table_id = p_table_id
    and o.restaurant_id = v_restaurant_id
    and o.status in ('pending', 'confirmed', 'preparing', 'ready', 'delivered');

  get diagnostics v_updated = row_count;

  return jsonb_build_object(
    'closed_count', v_updated,
    'table_id', p_table_id
  );
end;
$$;

revoke all on function public.close_restaurant_table(uuid) from public;
grant execute on function public.close_restaurant_table(uuid) to authenticated;

comment on function public.close_restaurant_table(uuid) is
  'Cierra la cuenta de una mesa: marca pedidos abiertos como closed (dueño/empleado).';

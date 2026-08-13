-- Estado del último pedido abierto de una mesa (solo status).
-- El comensal ya conoce table_id + restaurant_id vía QR; no se exponen ítems ni totales.

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

  select o.status, o.created_at
  into v_status, v_created_at
  from public.orders o
  where o.table_id = p_table_id
    and o.restaurant_id = p_restaurant_id
    and o.status not in ('cancelled', 'closed')
  order by o.created_at desc
  limit 1;

  if v_status is null then
    return null;
  end if;

  return jsonb_build_object(
    'status', v_status,
    'created_at', v_created_at
  );
end;
$$;

revoke all on function public.get_guest_table_order_status(uuid, uuid) from public;
grant execute on function public.get_guest_table_order_status(uuid, uuid) to anon, authenticated;

comment on function public.get_guest_table_order_status(uuid, uuid) is
  'Devuelve solo el status del último pedido abierto de la mesa (carta pública).';

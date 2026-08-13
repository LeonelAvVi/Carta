-- Extiende el RPC del comensal: además del status, expone el total de la cuenta abierta.

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

  select
    coalesce(sum(o.total), 0),
    count(*)::int
  into v_bill_total, v_order_count
  from public.orders o
  where o.table_id = p_table_id
    and o.restaurant_id = p_restaurant_id
    and o.status not in ('cancelled', 'closed');

  if v_order_count = 0 then
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

  return jsonb_build_object(
    'status', v_status,
    'created_at', v_created_at,
    'bill_total', v_bill_total,
    'order_count', v_order_count
  );
end;
$$;

comment on function public.get_guest_table_order_status(uuid, uuid) is
  'Carta pública: status del último pedido + total de la cuenta abierta de la mesa.';

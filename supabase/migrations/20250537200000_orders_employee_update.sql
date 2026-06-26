-- Empleados: pueden actualizar el estado de pedidos (no crear ni eliminar)

drop policy if exists orders_employee_update on public.orders;
create policy orders_employee_update
  on public.orders
  for update
  to authenticated
  using (public.is_restaurant_employee(restaurant_id))
  with check (public.is_restaurant_employee(restaurant_id));

grant update on table public.orders to authenticated;

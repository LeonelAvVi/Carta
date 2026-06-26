-- Habilitar Supabase Realtime en pedidos (dashboard en vivo)
--
-- Verificar en Supabase Dashboard:
-- 1. Database → Tables → orders → Enable Realtime (toggle ON)
-- 2. Database → Publications → supabase_realtime debe listar public.orders
-- 3. El dueño debe estar autenticado (RLS orders_owner_select)
--
-- SQL de verificación (ejecutar en SQL Editor):
--   select * from pg_publication_tables where pubname = 'supabase_realtime';
--   select relname, relreplident from pg_class where relname = 'orders';
--   -- relreplident: 'f' = full (correcto para filtros Realtime)

alter table public.orders replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end $$;

-- Realtime respeta RLS: el dueño necesita SELECT en orders
grant select on table public.orders to authenticated;

-- Bucket de logos para restaurantes (lectura pública, escritura del dueño)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'logos',
  'logos',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Lectura pública (carta pública muestra el logo)
drop policy if exists logos_public_select on storage.objects;
create policy logos_public_select
  on storage.objects
  for select
  to public
  using (bucket_id = 'logos');

-- Dueño sube en su carpeta: {user_id}/{restaurant_id}/...
drop policy if exists logos_owner_insert on storage.objects;
create policy logos_owner_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists logos_owner_update on storage.objects;
create policy logos_owner_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists logos_owner_delete on storage.objects;
create policy logos_owner_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Suscripción trial al crear restaurante
drop policy if exists subscriptions_owner_insert on public.subscriptions;
create policy subscriptions_owner_insert
  on public.subscriptions
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = subscriptions.restaurant_id and r.owner_id = (select auth.uid())
    )
  );

grant insert on table public.subscriptions to authenticated;

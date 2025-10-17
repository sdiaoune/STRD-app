-- Storage buckets for page logos and event covers

-- Create buckets if not exists
insert into storage.buckets (id, name, public)
values ('page-logos', 'page-logos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('event-covers', 'event-covers', true)
on conflict (id) do nothing;

-- Ensure RLS enabled on storage objects
alter table storage.objects enable row level security;

-- Public read policies
drop policy if exists "page-logos: public read" on storage.objects;
create policy "page-logos: public read" on storage.objects
  for select using (bucket_id = 'page-logos');

drop policy if exists "event-covers: public read" on storage.objects;
create policy "event-covers: public read" on storage.objects
  for select using (bucket_id = 'event-covers');

-- Authenticated write policies (insert/update/delete)
drop policy if exists "page-logos: authenticated insert" on storage.objects;
create policy "page-logos: authenticated insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'page-logos');

drop policy if exists "page-logos: authenticated update" on storage.objects;
create policy "page-logos: authenticated update" on storage.objects
  for update to authenticated
  using (bucket_id = 'page-logos')
  with check (bucket_id = 'page-logos');

drop policy if exists "page-logos: authenticated delete" on storage.objects;
create policy "page-logos: authenticated delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'page-logos');

drop policy if exists "event-covers: authenticated insert" on storage.objects;
create policy "event-covers: authenticated insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'event-covers');

drop policy if exists "event-covers: authenticated update" on storage.objects;
create policy "event-covers: authenticated update" on storage.objects
  for update to authenticated
  using (bucket_id = 'event-covers')
  with check (bucket_id = 'event-covers');

drop policy if exists "event-covers: authenticated delete" on storage.objects;
create policy "event-covers: authenticated delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'event-covers');




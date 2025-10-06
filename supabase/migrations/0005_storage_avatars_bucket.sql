-- Ensure public storage bucket for avatars and run media exists

-- Create bucket if not exists
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Enable RLS and add permissive read & authenticated write policies
alter table storage.objects enable row level security;

drop policy if exists "avatars: public read" on storage.objects;
create policy "avatars: public read" on storage.objects
  for select using (
    bucket_id = 'avatars'
  );

drop policy if exists "avatars: authenticated upload" on storage.objects;
create policy "avatars: authenticated upload" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'avatars'
  );

-- Optionally allow authenticated updates/deletes on their own objects when using service role.
-- For simplicity, allow authenticated update/delete on avatars bucket.
drop policy if exists "avatars: authenticated update" on storage.objects;
create policy "avatars: authenticated update" on storage.objects
  for update to authenticated using (bucket_id = 'avatars') with check (bucket_id = 'avatars');

drop policy if exists "avatars: authenticated delete" on storage.objects;
create policy "avatars: authenticated delete" on storage.objects
  for delete to authenticated using (bucket_id = 'avatars');





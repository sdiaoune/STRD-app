-- Admin badges and pinning support

-- Profiles: badges
alter table public.profiles add column if not exists is_certified boolean not null default false;
alter table public.profiles add column if not exists sponsored_until timestamptz null;

-- Pinning: run posts, events, and organization posts
alter table public.run_posts add column if not exists pinned_until timestamptz null;
alter table public.events add column if not exists pinned_until timestamptz null;
alter table public.organization_posts add column if not exists pinned_until timestamptz null;

-- RLS: allow super admins to update any profile
drop policy if exists "Profiles: Super admin update any" on public.profiles;
create policy "Profiles: Super admin update any" on public.profiles
for update using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and (p.is_super_admin = true or p.role = 'super_admin')
  )
) with check (true);

-- RLS: allow super admins to update any run post
drop policy if exists "Run posts: Super admin update any" on public.run_posts;
create policy "Run posts: Super admin update any" on public.run_posts
for update using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and (p.is_super_admin = true or p.role = 'super_admin')
  )
) with check (true);

-- RLS: allow super admins to update any event
drop policy if exists "Events: Super admin update any" on public.events;
create policy "Events: Super admin update any" on public.events
for update using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and (p.is_super_admin = true or p.role = 'super_admin')
  )
) with check (true);



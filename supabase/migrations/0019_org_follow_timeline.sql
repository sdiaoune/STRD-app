-- Ensure organization follow relation + timeline view include org context
set check_function_bodies = off;

-- Guarantee table shape + indexes exist for org follows
create table if not exists public.user_following_organizations (
  user_id uuid not null references public.profiles(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, org_id)
);

create index if not exists idx_user_following_orgs_user on public.user_following_organizations (user_id);
create index if not exists idx_user_following_orgs_org on public.user_following_organizations (org_id);

alter table public.user_following_organizations enable row level security;

drop policy if exists "Followings: Read own" on public.user_following_organizations;
create policy "Followings: Read own" on public.user_following_organizations
  for select using (auth.uid() = user_id);

drop policy if exists "Followings: Insert own" on public.user_following_organizations;
create policy "Followings: Insert own" on public.user_following_organizations
  for insert with check (auth.uid() = user_id);

drop policy if exists "Followings: Delete own" on public.user_following_organizations;
create policy "Followings: Delete own" on public.user_following_organizations
  for delete using (auth.uid() = user_id);

-- Surface org context on timeline view for downstream personalization
drop view if exists public.app_timeline_items;
create view public.app_timeline_items as
select
  'run'::text as "type",
  r.id::text as "refId",
  r.created_at as "createdAtISO",
  null::text as "orgId"
from public.run_posts r
union all
select
  'event'::text,
  e.id::text,
  e.date,
  e.org_id::text
from public.events e
union all
select
  'page_post'::text,
  p.id::text,
  p.created_at,
  p.org_id::text
from public.organization_posts p;



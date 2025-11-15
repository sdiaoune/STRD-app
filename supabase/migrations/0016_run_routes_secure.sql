-- Secure run route geometry so only the owning runner can access it.

-- 1. Dedicated table for sensitive route data
create table if not exists public.run_routes (
  run_id uuid primary key references public.run_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  route_polyline text,
  route_preview_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_run_routes_user on public.run_routes(user_id);

-- Keep user_id + timestamps in sync with the parent run
create or replace function public.sync_run_route_owner()
returns trigger as $$
declare
  owner_id uuid;
begin
  select user_id into owner_id from public.run_posts where id = new.run_id;
  if owner_id is null then
    raise exception 'Run % does not exist for run_routes entry', new.run_id;
  end if;
  new.user_id := owner_id;
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_run_routes_owner on public.run_routes;
create trigger trg_run_routes_owner
before insert or update on public.run_routes
for each row execute procedure public.sync_run_route_owner();

-- 2. Backfill data from the original columns before dropping them
insert into public.run_routes (run_id, route_polyline, route_preview_url)
select
  id,
  route_polyline,
  route_preview_url
from public.run_posts
where (route_polyline is not null or route_preview_url is not null)
on conflict (run_id) do update
set
  route_polyline = excluded.route_polyline,
  route_preview_url = excluded.route_preview_url,
  updated_at = now();

-- 3. RLS policies: only the owner can read/write their routes
alter table public.run_routes enable row level security;

drop policy if exists "Run routes: owner select" on public.run_routes;
create policy "Run routes: owner select" on public.run_routes
  for select using (auth.uid() = user_id);

drop policy if exists "Run routes: owner insert" on public.run_routes;
create policy "Run routes: owner insert" on public.run_routes
  for insert with check (auth.uid() = user_id);

drop policy if exists "Run routes: owner update" on public.run_routes;
create policy "Run routes: owner update" on public.run_routes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Run routes: owner delete" on public.run_routes;
create policy "Run routes: owner delete" on public.run_routes
  for delete using (auth.uid() = user_id);

-- 4. Refresh dependent view before removing old columns
drop view if exists public.app_run_posts;

alter table public.run_posts
  drop column if exists route_polyline,
  drop column if exists route_preview_url;

-- 5. Recreate app_run_posts view with owner-only route visibility
create view public.app_run_posts as
select
  r.id,
  r.user_id::text as "userId",
  r.created_at as "createdAtISO",
  r.distance_km as "distanceKm",
  r.duration_min as "durationMin",
  r.avg_pace_min_per_km as "avgPaceMinPerKm",
  r.activity_type as "activityType",
  case when auth.uid() = r.user_id then rr.route_polyline else null end as "routePolyline",
  case when auth.uid() = r.user_id then rr.route_preview_url else null end as "routePreview",
  r.caption,
  r.is_from_partner as "isFromPartner",
  r.likes_count as "likes",
  exists (
    select 1
    from public.run_post_likes l
    where l.post_id = r.id and l.user_id = auth.uid()
  ) as "likedByCurrentUser",
  coalesce(
    (
      select json_agg(json_build_object(
        'id', c.id,
        'userId', c.user_id::text,
        'text', c.text,
        'createdAtISO', c.created_at
      ) order by c.created_at)
      from public.comments c
      where c.post_id = r.id
    ), '[]'::json
  ) as "comments"
from public.run_posts r
left join public.run_routes rr on rr.run_id = r.id;



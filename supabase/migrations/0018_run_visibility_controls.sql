-- Run visibility controls: ensure metadata, policies, and views expose visibility.

-- 1. Ensure visibility column exists and defaults sensibly.
alter table public.run_posts
  add column if not exists visibility text
    check (visibility in ('public','followers','private'))
    default 'private';

-- Backfill historical rows so they're at least limited to followers instead of being private forever.
update public.run_posts
set visibility = 'followers'
where visibility is null or visibility = 'private';

-- Keep column default aligned with the app's recommended default of followers.
alter table public.run_posts
  alter column visibility set default 'followers';

create index if not exists idx_run_posts_visibility on public.run_posts(visibility);

-- 2. Refresh visibility-aware select policy (other CRUD policies already guard ownership).
alter table public.run_posts enable row level security;
drop policy if exists "Run posts: read visibility" on public.run_posts;
create policy "Run posts: read visibility" on public.run_posts
  for select using (
    user_id = auth.uid()
    or visibility = 'public'
    or (visibility = 'followers' and public.is_follower(user_id))
  );

-- 3. Ensure every profile has user_preferences row seeded with sensible defaults.
insert into public.user_preferences (user_id, default_run_visibility)
select p.id, 'followers'
from public.profiles p
where not exists (
  select 1 from public.user_preferences pref where pref.user_id = p.id
);

-- 4. Refresh app_run_posts view with visibility field surfaced.
drop view if exists public.app_run_posts;

create view public.app_run_posts as
select
  r.id,
  r.user_id::text as "userId",
  r.created_at as "createdAtISO",
  r.distance_km as "distanceKm",
  r.duration_min as "durationMin",
  r.avg_pace_min_per_km as "avgPaceMinPerKm",
  r.activity_type as "activityType",
  r.visibility as "visibility",
  case when auth.uid() = r.user_id then rr.route_polyline else null end as "routePolyline",
  r.route_preview_url as "routePreview",
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



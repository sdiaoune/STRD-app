-- Restore public access to run preview images while keeping routes private.

alter table public.run_posts
  add column if not exists route_preview_url text;

-- Copy over any previously secured previews.
update public.run_posts rp
set route_preview_url = rr.route_preview_url
from public.run_routes rr
where rr.run_id = rp.id
  and rr.route_preview_url is not null
  and (rp.route_preview_url is distinct from rr.route_preview_url);

-- Refresh view so preview URLs are readable by anyone while routes remain owner-only.
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



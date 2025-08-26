-- Initial schema for STRD app (Supabase)
-- Creates tables, policies, triggers, indexes, and camelCase views matching frontend types

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Organizations
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('community', 'partner')),
  logo_url text,
  city text not null,
  created_at timestamptz not null default now()
);

-- Profiles (Users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text,
  handle text unique,
  avatar_url text,
  city text,
  interests text[]
);

-- User follows Organizations (normalized relation for followingOrgs)
create table if not exists public.user_following_organizations (
  user_id uuid not null references public.profiles(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, org_id)
);

-- Events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  date timestamptz not null,
  city text not null,
  location_name text not null,
  location_lat double precision not null,
  location_lon double precision not null,
  tags text[] not null default '{}',
  description text,
  distance_from_user_km double precision,
  created_at timestamptz not null default now()
);

-- Run Posts
create table if not exists public.run_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  distance_km double precision not null,
  duration_min integer not null,
  avg_pace_min_per_km double precision not null,
  activity_type text not null default 'run',
  route_polyline text,
  route_preview_url text,
  caption text,
  is_from_partner boolean not null default false,
  likes_count integer not null default 0
);

-- Likes for Run Posts
create table if not exists public.run_post_likes (
  post_id uuid not null references public.run_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- Comments on Run Posts
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.run_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_profiles_handle on public.profiles (lower(handle));
create index if not exists idx_events_org on public.events (org_id);
create index if not exists idx_events_date on public.events (date);
create index if not exists idx_events_tags on public.events using gin (tags);
create index if not exists idx_run_posts_user on public.run_posts (user_id);
create index if not exists idx_comments_post on public.comments (post_id);
create index if not exists idx_likes_post on public.run_post_likes (post_id);
create index if not exists idx_likes_user on public.run_post_likes (user_id);

-- Trigger: keep profiles.updated_at fresh
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- Trigger: maintain likes_count on run_posts
create or replace function public.handle_run_post_like_count() returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.run_posts set likes_count = likes_count + 1 where id = new.post_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update public.run_posts set likes_count = greatest(likes_count - 1, 0) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_run_post_likes_insert on public.run_post_likes;
drop trigger if exists trg_run_post_likes_delete on public.run_post_likes;
create trigger trg_run_post_likes_insert
after insert on public.run_post_likes
for each row execute procedure public.handle_run_post_like_count();
create trigger trg_run_post_likes_delete
after delete on public.run_post_likes
for each row execute procedure public.handle_run_post_like_count();

-- CamelCase Views to match frontend DTOs exactly
-- Users
drop view if exists public.app_users cascade;
create view public.app_users as
select
  p.id,
  p.name,
  p.handle,
  p.avatar_url as "avatar",
  p.city,
  coalesce(p.interests, '{}'::text[]) as "interests",
  coalesce(array_agg(f.org_id::text) filter (where f.org_id is not null), '{}'::text[]) as "followingOrgs"
from public.profiles p
left join public.user_following_organizations f on f.user_id = p.id
group by p.id;

-- Organizations
drop view if exists public.app_organizations cascade;
create view public.app_organizations as
select
  id,
  name,
  type,
  logo_url as "logo",
  city
from public.organizations;

-- Events
drop view if exists public.app_events cascade;
create view public.app_events as
select
  e.id,
  e.org_id::text as "orgId",
  e.title,
  e.date as "dateISO",
  e.city,
  jsonb_build_object('name', e.location_name, 'lat', e.location_lat, 'lon', e.location_lon) as "location",
  e.tags,
  e.description,
  e.distance_from_user_km as "distanceFromUserKm"
from public.events e;

-- Run Posts (with likes and embedded comments)
drop view if exists public.app_run_posts cascade;
create view public.app_run_posts as
select
  r.id,
  r.user_id::text as "userId",
  r.created_at as "createdAtISO",
  r.distance_km as "distanceKm",
  r.duration_min as "durationMin",
  r.avg_pace_min_per_km as "avgPaceMinPerKm",
  r.activity_type as "activityType",
  r.route_polyline as "routePolyline",
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
from public.run_posts r;

-- Timeline (union of run posts and events): caller should apply ordering in query
-- Matches: { type: 'run' | 'event'; refId: string; createdAtISO: timestamp }
drop view if exists public.app_timeline_items cascade;
create view public.app_timeline_items as
select 'run'::text as "type", r.id::text as "refId", r.created_at as "createdAtISO" from public.run_posts r
union all
select 'event'::text, e.id::text, e.date from public.events e;

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.user_following_organizations enable row level security;
alter table public.events enable row level security;
alter table public.run_posts enable row level security;
alter table public.run_post_likes enable row level security;
alter table public.comments enable row level security;

-- Profiles policies: read all, self-manage
drop policy if exists "Profiles: Public read" on public.profiles;
create policy "Profiles: Public read" on public.profiles for select using (true);

drop policy if exists "Profiles: Self update" on public.profiles;
create policy "Profiles: Self update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Profiles: Insert own row" on public.profiles;
create policy "Profiles: Insert own row" on public.profiles for insert with check (auth.uid() = id);

-- Organizations policies: read all
drop policy if exists "Organizations: Public read" on public.organizations;
create policy "Organizations: Public read" on public.organizations for select using (true);

-- Events policies: read all
drop policy if exists "Events: Public read" on public.events;
create policy "Events: Public read" on public.events for select using (true);

-- Run posts policies: read all; create/update/delete own
drop policy if exists "Run posts: Public read" on public.run_posts;
create policy "Run posts: Public read" on public.run_posts for select using (true);

drop policy if exists "Run posts: Insert own" on public.run_posts;
create policy "Run posts: Insert own" on public.run_posts for insert with check (auth.uid() = user_id);

drop policy if exists "Run posts: Update own" on public.run_posts;
create policy "Run posts: Update own" on public.run_posts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Run posts: Delete own" on public.run_posts;
create policy "Run posts: Delete own" on public.run_posts for delete using (auth.uid() = user_id);

-- Comments policies: read all; create/update/delete own
drop policy if exists "Comments: Public read" on public.comments;
create policy "Comments: Public read" on public.comments for select using (true);

drop policy if exists "Comments: Insert own" on public.comments;
create policy "Comments: Insert own" on public.comments for insert with check (auth.uid() = user_id);

drop policy if exists "Comments: Update own" on public.comments;
create policy "Comments: Update own" on public.comments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Comments: Delete own" on public.comments;
create policy "Comments: Delete own" on public.comments for delete using (auth.uid() = user_id);

-- Likes policies: read all; like/unlike by the acting user
drop policy if exists "Likes: Public read" on public.run_post_likes;
create policy "Likes: Public read" on public.run_post_likes for select using (true);

drop policy if exists "Likes: Insert own" on public.run_post_likes;
create policy "Likes: Insert own" on public.run_post_likes for insert with check (auth.uid() = user_id);

drop policy if exists "Likes: Delete own" on public.run_post_likes;
create policy "Likes: Delete own" on public.run_post_likes for delete using (auth.uid() = user_id);

-- Following policies: read/manage own
drop policy if exists "Followings: Read own" on public.user_following_organizations;
create policy "Followings: Read own" on public.user_following_organizations for select using (auth.uid() = user_id);

drop policy if exists "Followings: Insert own" on public.user_following_organizations;
create policy "Followings: Insert own" on public.user_following_organizations for insert with check (auth.uid() = user_id);

drop policy if exists "Followings: Delete own" on public.user_following_organizations;
create policy "Followings: Delete own" on public.user_following_organizations for delete using (auth.uid() = user_id);
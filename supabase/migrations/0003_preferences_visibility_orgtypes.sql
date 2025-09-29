-- User preferences
create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  theme text not null default 'system' check (theme in ('system','light','dark')),
  default_run_visibility text not null default 'private' check (default_run_visibility in ('private','followers','public')),
  notify_likes boolean not null default true,
  notify_follows boolean not null default true,
  notify_event_invites boolean not null default true,
  updated_at timestamptz not null default now()
);

create or replace function public.bu_user_preferences_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists trg_bu_user_prefs on public.user_preferences;
create trigger trg_bu_user_prefs before update on public.user_preferences
for each row execute procedure public.bu_user_preferences_updated_at();

alter table public.user_preferences enable row level security;
drop policy if exists "prefs: read write own" on public.user_preferences;
create policy "prefs: read write own" on public.user_preferences
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Runs visibility
alter table public.run_posts
  add column if not exists visibility text not null default 'private'
  check (visibility in ('private','followers','public'));

create index if not exists idx_run_posts_visibility on public.run_posts(visibility);

create or replace function public.is_follower(author_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.user_follows f
    where f.followee_id = author_id and f.follower_id = auth.uid()
  );
$$;

alter table public.run_posts enable row level security;
drop policy if exists "Run posts: read visibility" on public.run_posts;
create policy "Run posts: read visibility" on public.run_posts for select
using (
  user_id = auth.uid()
  or visibility = 'public'
  or (visibility = 'followers' and public.is_follower(user_id))
);

-- Organization types expansion
alter table public.organizations
  drop constraint if exists organizations_type_check;
alter table public.organizations
  add constraint organizations_type_check
  check (type in ('community','partner','sponsor','run_club'));

create index if not exists idx_org_type on public.organizations(type);



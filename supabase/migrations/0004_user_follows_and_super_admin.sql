-- User follows table and Super Admin support

-- Create user_follows if it does not exist
create table if not exists public.user_follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followee_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint user_follows_self_follow check (follower_id <> followee_id),
  primary key (follower_id, followee_id)
);

create index if not exists idx_user_follows_follower on public.user_follows(follower_id);
create index if not exists idx_user_follows_followee on public.user_follows(followee_id);

alter table public.user_follows enable row level security;

-- Policies: allow selecting relationships that involve the current user, and managing own follows
drop policy if exists "User follows: read own" on public.user_follows;
create policy "User follows: read own" on public.user_follows for select
  using (follower_id = auth.uid() or followee_id = auth.uid());

drop policy if exists "User follows: insert own" on public.user_follows;
create policy "User follows: insert own" on public.user_follows for insert
  with check (follower_id = auth.uid());

drop policy if exists "User follows: delete own" on public.user_follows;
create policy "User follows: delete own" on public.user_follows for delete
  using (follower_id = auth.uid());

-- Super Admin flag on profiles to enable partner boosting and admin features
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'is_super_admin'
  ) then
    alter table public.profiles add column is_super_admin boolean not null default false;
  end if;
end $$;

-- Optional: role text column for future extensibility
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'role'
  ) then
    alter table public.profiles add column role text;
  end if;
end $$;





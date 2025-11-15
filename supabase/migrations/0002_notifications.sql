-- Notifications: likes, follows, event invites
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('like','follow','event_invite')),
  target_type text not null check (target_type in ('post','user','event')),
  target_id uuid not null,
  data jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_recipient_created
  on public.notifications(recipient_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notif: read own" on public.notifications;
create policy "notif: read own" on public.notifications for select
  using (recipient_id = auth.uid());

drop policy if exists "notif: mark own read" on public.notifications;
create policy "notif: mark own read" on public.notifications for update
  using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

-- Like → notification
create or replace function public.notify_like() returns trigger as $$
begin
  if new.user_id <> (select user_id from public.run_posts where id = new.post_id) then
    insert into public.notifications (recipient_id, actor_id, type, target_type, target_id, data)
    select (select user_id from public.run_posts where id = new.post_id), new.user_id, 'like', 'post', new.post_id, jsonb_build_object('postId', new.post_id);
  end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_like_notify on public.run_post_likes;
create trigger trg_like_notify after insert on public.run_post_likes
for each row execute procedure public.notify_like();

-- Follow → notification
create or replace function public.notify_follow() returns trigger as $$
begin
  if new.follower_id <> new.followee_id then
    insert into public.notifications (recipient_id, actor_id, type, target_type, target_id, data)
    values (new.followee_id, new.follower_id, 'follow', 'user', new.followee_id, '{}'::jsonb);
  end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_follow_notify on public.user_follows;
create trigger trg_follow_notify after insert on public.user_follows
for each row execute procedure public.notify_follow();

-- Event invite table assumed as public.event_invites(inviter_id, invitee_id, event_id)
create or replace function public.notify_event_invite() returns trigger as $$
begin
  insert into public.notifications (recipient_id, actor_id, type, target_type, target_id, data)
  values (new.invitee_id, new.inviter_id, 'event_invite', 'event', new.event_id, '{}'::jsonb);
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_event_invite_notify on public.event_invites;
create trigger trg_event_invite_notify after insert on public.event_invites
for each row execute procedure public.notify_event_invite();



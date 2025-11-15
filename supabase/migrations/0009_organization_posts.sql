-- Organization (Page) Posts: table, indexes, RLS and policies

-- 1) Table
create table if not exists public.organization_posts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  content text not null,
  image_url text,
  created_by uuid references public.profiles(id) on delete set null
);

-- 2) Indexes
create index if not exists idx_org_posts_org on public.organization_posts (org_id);
create index if not exists idx_org_posts_org_created_at on public.organization_posts (org_id, created_at desc);
create index if not exists idx_org_posts_created_at on public.organization_posts (created_at desc);

-- 3) RLS
alter table public.organization_posts enable row level security;

-- Helper predicate for super admin checks (inline in policies to avoid function dependency)
-- Read policy: public
drop policy if exists "Org posts: Public read" on public.organization_posts;
create policy "Org posts: Public read" on public.organization_posts
  for select using (true);

-- Insert: org owner or super admin
drop policy if exists "Org posts: Insert via owner or super admin" on public.organization_posts;
create policy "Org posts: Insert via owner or super admin" on public.organization_posts
  for insert
  with check (
    exists (
      select 1 from public.organizations o
      where o.id = org_id and o.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.is_super_admin = true or p.role = 'super_admin')
    )
  );

-- Update: org owner or super admin
drop policy if exists "Org posts: Update via owner or super admin" on public.organization_posts;
create policy "Org posts: Update via owner or super admin" on public.organization_posts
  for update
  using (
    exists (
      select 1 from public.organizations o
      where o.id = org_id and o.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.is_super_admin = true or p.role = 'super_admin')
    )
  )
  with check (
    exists (
      select 1 from public.organizations o
      where o.id = org_id and o.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.is_super_admin = true or p.role = 'super_admin')
    )
  );

-- Delete: org owner or super admin
drop policy if exists "Org posts: Delete via owner or super admin" on public.organization_posts;
create policy "Org posts: Delete via owner or super admin" on public.organization_posts
  for delete
  using (
    exists (
      select 1 from public.organizations o
      where o.id = org_id and o.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.is_super_admin = true or p.role = 'super_admin')
    )
  );

-- 4) Trigger: set created_by to acting user if null
create or replace function public.set_org_post_creator()
returns trigger as $$
begin
  if new.created_by is null then
    new.created_by = auth.uid();
  end if;
  return new;
end; $$ language plpgsql security definer;

drop trigger if exists trg_org_posts_set_creator on public.organization_posts;
create trigger trg_org_posts_set_creator
before insert on public.organization_posts
for each row execute procedure public.set_org_post_creator();




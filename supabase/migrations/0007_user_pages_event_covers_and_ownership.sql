-- User-created Pages & Events: ownership and event creator tracking

-- 1) Ownership on Pages (organizations)
alter table public.organizations
  add column if not exists owner_id uuid references public.profiles(id) on delete set null;
create index if not exists idx_org_owner on public.organizations(owner_id);

-- 2) Event creator tracking (cover_image_url already added in 0006)
alter table public.events
  add column if not exists created_by uuid references public.profiles(id) on delete set null;
create index if not exists idx_events_created_by on public.events(created_by);

-- 3) RLS policies (keep existing public read policies)
-- Pages (organizations)
drop policy if exists "Organizations: Insert own" on public.organizations;
create policy "Organizations: Insert own" on public.organizations
  for insert
  with check (auth.uid() = owner_id);

drop policy if exists "Organizations: Update own" on public.organizations;
create policy "Organizations: Update own" on public.organizations
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Organizations: Delete own" on public.organizations;
create policy "Organizations: Delete own" on public.organizations
  for delete
  using (auth.uid() = owner_id);

-- Events (public read already exists)
-- Insert: must be page owner; created_by is set by trigger below
drop policy if exists "Events: Insert via page owner" on public.events;
create policy "Events: Insert via page owner" on public.events
  for insert
  with check (
    exists (
      select 1 from public.organizations o
      where o.id = org_id and o.owner_id = auth.uid()
    )
  );

-- Update/Delete: page owner OR event creator
drop policy if exists "Events: Update via page owner" on public.events;
create policy "Events: Update via owner or creator" on public.events
  for update
  using (
    auth.uid() = created_by or exists (
      select 1 from public.organizations o
      where o.id = org_id and o.owner_id = auth.uid()
    )
  )
  with check (
    auth.uid() = created_by or exists (
      select 1 from public.organizations o
      where o.id = org_id and o.owner_id = auth.uid()
    )
  );

drop policy if exists "Events: Delete via page owner" on public.events;
create policy "Events: Delete via owner or creator" on public.events
  for delete
  using (
    auth.uid() = created_by or exists (
      select 1 from public.organizations o
      where o.id = org_id and o.owner_id = auth.uid()
    )
  );

-- Ensure created_by defaults to the acting user
create or replace function public.set_event_creator()
returns trigger as $$
begin
  if new.created_by is null then
    new.created_by = auth.uid();
  end if;
  return new;
end; $$ language plpgsql security definer;

drop trigger if exists trg_events_set_creator on public.events;
create trigger trg_events_set_creator
before insert on public.events
for each row execute procedure public.set_event_creator();




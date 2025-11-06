-- Organizations: Certified support and super admin policy
alter table public.organizations add column if not exists is_certified boolean not null default false;

-- Allow super admins to update any organization (to toggle is_certified)
drop policy if exists "Organizations: Super admin update any" on public.organizations;
create policy "Organizations: Super admin update any" on public.organizations
for update using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and (p.is_super_admin = true or p.role = 'super_admin')
  )
) with check (true);



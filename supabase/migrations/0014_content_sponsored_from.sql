-- Add sponsored_from to schedule sponsorship windows

alter table public.run_posts add column if not exists sponsored_from timestamptz null;
alter table public.events add column if not exists sponsored_from timestamptz null;
alter table public.organization_posts add column if not exists sponsored_from timestamptz null;



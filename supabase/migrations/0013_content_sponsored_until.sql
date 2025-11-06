-- Rename pinning to sponsored for content

-- Run Posts
alter table public.run_posts add column if not exists sponsored_until timestamptz null;
update public.run_posts set sponsored_until = pinned_until where sponsored_until is null and pinned_until is not null;
alter table public.run_posts drop column if exists pinned_until;

-- Events
alter table public.events add column if not exists sponsored_until timestamptz null;
update public.events set sponsored_until = pinned_until where sponsored_until is null and pinned_until is not null;
alter table public.events drop column if exists pinned_until;

-- Organization (Page) Posts
alter table public.organization_posts add column if not exists sponsored_until timestamptz null;
update public.organization_posts set sponsored_until = pinned_until where sponsored_until is null and pinned_until is not null;
alter table public.organization_posts drop column if exists pinned_until;



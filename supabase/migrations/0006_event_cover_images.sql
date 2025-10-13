-- Add cover image support for events
-- The frontend already expects cover_image_url in the Event model

-- Add cover_image_url column to events table
alter table public.events 
add column if not exists cover_image_url text;

-- Add index for faster queries when filtering by cover images
create index if not exists idx_events_cover_image on public.events (cover_image_url) where cover_image_url is not null;

-- Comment for documentation
comment on column public.events.cover_image_url is 'URL to the event cover/hero image displayed in event cards';


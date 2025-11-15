-- Ensure run visibility policies no longer fall back to legacy "public read".

-- Drop the legacy allow-all policy if it still exists from the initial bootstrap migration.
drop policy if exists "Run posts: Public read" on public.run_posts;

-- Recreate the scoped select policy so it's the only reader.
drop policy if exists "Run posts: read visibility" on public.run_posts;
create policy "Run posts: read visibility" on public.run_posts
  for select using (
    user_id = auth.uid()
    or visibility = 'public'
    or (visibility = 'followers' and public.is_follower(user_id))
  );



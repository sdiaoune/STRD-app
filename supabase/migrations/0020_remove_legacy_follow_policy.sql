-- Remove legacy policy that ignored visibility.

drop policy if exists "Run posts: Read own or followed" on public.run_posts;



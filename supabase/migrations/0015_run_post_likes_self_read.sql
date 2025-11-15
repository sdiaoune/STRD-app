-- Drop and recreate visibility-based read policy (logic unchanged, just ensures consistent definition)
drop policy if exists "Likes: read if post visible" on public.run_post_likes;
create policy "Likes: read if post visible" on public.run_post_likes
  for select using (
    exists (
      select 1
      from run_posts p
      where p.id = run_post_likes.post_id
        and (
          p.user_id = auth.uid()
          or p.visibility = 'public'
          or (p.visibility = 'followers' and is_follower(p.user_id))
        )
    )
  );

-- New policy: allow users to always read their own likes, even if the post is private
drop policy if exists "Likes: read own likes" on public.run_post_likes;
create policy "Likes: read own likes" on public.run_post_likes
  for select using (auth.uid() = user_id);


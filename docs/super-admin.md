Super Admins, Badges, and Pinning

Overview
- Super Admins can:
  - Toggle Certified badge on any profile
  - Set Sponsored until on any profile (24h/7d quick actions in Admin Tools)
  - Pin/unpin any run post, page post, or event
  - Promote/demote other users to/from Super Admin

How to access Admin Tools
1. Sign in with a Super Admin account
2. Open Settings → Admin → Open Admin Tools

Admin Tools screen
- Search by name
- For each result:
  - Certified: toggles `profiles.is_certified`
  - Sponsored: +24h, +7d, or Clear (updates `profiles.sponsored_until`)
  - Super Admin: toggles `profiles.is_super_admin` and `role`

Inline quick actions
- Pinned actions are available on cards for Super Admins:
  - Run posts, events, page posts show a pin icon in the header
  - Tap to pin for 7 days; tap again to unpin
  - A “Pinned” pill displays when active

Sorting behavior
- Timeline and Events screens surface pinned items first (active while `pinned_until > now()`). Remaining items follow previous ordering rules.

Organization follow + timeline context
- Followers are stored in `user_following_organizations (user_id, org_id, created_at)` with strict RLS mirroring `user_follows`.
- `public.app_timeline_items` now emits `orgId` for both events and organization posts, so the client can filter “For You” timelines without refetching extra metadata.
- When a user follows an organization its future events and posts automatically unlock in the “For You” tab; unfollowing removes them immediately from the personalized feed.

Initial Super Admins
- Migrations set Super Admin for:
  - romanroberts4@gmail.com
  - soya@myhoneybot.com

Rollback
- Unpin: set `pinned_until = null`
- Remove badges: set `is_certified = false`, `sponsored_until = null`
- Demote Super Admin: set `is_super_admin = false`, `role = null`



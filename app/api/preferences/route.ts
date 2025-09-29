import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: profile } = await supabase.auth.getUser();
  if (!profile.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabase.from('user_preferences').select('*').eq('user_id', profile.user.id).maybeSingle();
  const prefs = data || {
    user_id: profile.user.id,
    theme: 'system',
    default_run_visibility: 'private',
    notify_likes: true,
    notify_follows: true,
    notify_event_invites: true,
  };
  return NextResponse.json({
    theme: prefs.theme,
    defaultRunVisibility: prefs.default_run_visibility,
    notifyLikes: prefs.notify_likes,
    notifyFollows: prefs.notify_follows,
    notifyEventInvites: prefs.notify_event_invites,
  });
}

export async function PATCH(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: profile } = await supabase.auth.getUser();
  if (!profile.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const updates: any = {};
  if (body.theme) updates.theme = body.theme;
  if (body.defaultRunVisibility) updates.default_run_visibility = body.defaultRunVisibility;
  if (typeof body.notifyLikes === 'boolean') updates.notify_likes = body.notifyLikes;
  if (typeof body.notifyFollows === 'boolean') updates.notify_follows = body.notifyFollows;
  if (typeof body.notifyEventInvites === 'boolean') updates.notify_event_invites = body.notifyEventInvites;

  // Upsert preference row
  const { error } = await supabase.from('user_preferences').upsert({ user_id: profile.user.id, ...updates });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}



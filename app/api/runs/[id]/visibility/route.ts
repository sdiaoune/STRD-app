import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await req.json().catch(() => ({}));
  const visibility = body?.visibility as 'private'|'followers'|'public'|undefined;
  if (!visibility) return NextResponse.json({ error: 'visibility required' }, { status: 400 });

  // Update only if the post belongs to the user
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { error } = await supabase
    .from('run_posts')
    .update({ visibility })
    .eq('id', params.id)
    .eq('user_id', me.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}



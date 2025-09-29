import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(_req: NextRequest, { params }: { params: { postId: string } }) {
  const { postId } = params;
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase
    .from('run_post_likes')
    .select('user:users(id, name, handle, avatar_url)')
    .eq('post_id', postId)
    .limit(1000);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const users = (data || []).map((r: any) => ({ id: r.user.id, name: r.user.name, handle: r.user.handle, avatar: r.user.avatar_url }));
  return NextResponse.json({ count: users.length, users });
}



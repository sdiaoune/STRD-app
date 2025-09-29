import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
  const cursor = searchParams.get('cursor');

  const query = supabase
    .from('notifications')
    .select('id, type, target_type, target_id, data, is_read, created_at, actor:actor_id(id, name, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) query.lt('created_at', cursor);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const nextCursor = data && data.length === limit ? data[data.length - 1].created_at : null;
  return NextResponse.json({ items: data || [], nextCursor });
}

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await req.json().catch(() => ({}));
  if (body && body.action === 'markAllRead') {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ updated: true });
  }
  if (Array.isArray(body?.ids) && body.ids.length > 0) {
    const { error } = await supabase.from('notifications').update({ is_read: true }).in('id', body.ids);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ updated: body.ids.length });
  }
  return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
}



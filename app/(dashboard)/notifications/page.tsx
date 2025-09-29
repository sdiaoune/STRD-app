'use client';
import useSWR from 'swr';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function NotificationsPage() {
  const { data, error, mutate } = useSWR('/api/notifications?limit=50', fetcher);
  const [marking, setMarking] = useState(false);
  const items = data?.items || [];
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Notifications</h1>
        <button
          className="px-3 py-1 text-sm rounded border"
          onClick={async () => { setMarking(true); await fetch('/api/notifications', { method: 'POST', body: JSON.stringify({ action: 'markAllRead' }) }); setMarking(false); mutate(); }}
          disabled={marking}
        >
          Mark all read
        </button>
      </div>
      {error && <div className="text-red-500">Failed to load</div>}
      <ul className="divide-y rounded border">
        {items.map((n: any) => (
          <li key={n.id} className="p-3 flex items-start gap-3">
            <div className="text-sm">
              <div className="font-medium">{n.type}</div>
              <div className="text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="p-4 text-sm text-muted-foreground">No notifications</li>}
      </ul>
    </div>
  );
}



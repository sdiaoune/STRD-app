'use client';
import useSWR from 'swr';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function SettingsPage() {
  const { data, mutate } = useSWR('/api/preferences', fetcher);
  const [saving, setSaving] = useState(false);
  const prefs = data || { theme: 'system', defaultRunVisibility: 'private', notifyLikes: true, notifyFollows: true, notifyEventInvites: true };

  const update = async (patch: any) => {
    setSaving(true);
    await fetch('/api/preferences', { method: 'PATCH', body: JSON.stringify(patch) });
    setSaving(false);
    mutate();
  };

  return (
    <div className="p-4 space-y-6 max-w-xl">
      <h1 className="text-xl font-semibold">Settings</h1>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Appearance</h2>
        <div className="flex gap-2">
          {['system','light','dark'].map(t => (
            <button key={t} className={`px-3 py-1 rounded border ${prefs.theme===t?'bg-primary text-primary-foreground':''}`} onClick={() => update({ theme: t })} disabled={saving}>{t}</button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Runs</h2>
        <div className="flex gap-2">
          {['private','followers','public'].map(v => (
            <button key={v} className={`px-3 py-1 rounded border ${prefs.defaultRunVisibility===v?'bg-primary text-primary-foreground':''}`} onClick={() => update({ defaultRunVisibility: v })} disabled={saving}>{v}</button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Notifications</h2>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2"><input type="checkbox" checked={!!prefs.notifyLikes} onChange={e=>update({ notifyLikes: e.target.checked })} /> Likes</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={!!prefs.notifyFollows} onChange={e=>update({ notifyFollows: e.target.checked })} /> Follows</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={!!prefs.notifyEventInvites} onChange={e=>update({ notifyEventInvites: e.target.checked })} /> Event invites</label>
        </div>
      </section>
    </div>
  );
}



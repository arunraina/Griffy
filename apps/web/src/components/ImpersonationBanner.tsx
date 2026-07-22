'use client';

import { useEffect, useState } from 'react';
import { getImpersonationTarget, clearImpersonation, type ImpersonationTarget } from '@/lib/impersonation';
import { endImpersonation } from '@/lib/admin';

// Mounted once in the root layout so it's visible on every page while an
// admin is viewing as another user -- reads sessionStorage directly rather
// than through AuthProvider, since this needs to work independent of that
// context's own load state.
export default function ImpersonationBanner() {
  const [target, setTarget] = useState<ImpersonationTarget | null>(null);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    setTarget(getImpersonationTarget());
  }, []);

  if (!target) return null;
  const targetId = target.id;

  async function handleExit() {
    setExiting(true);
    try {
      await endImpersonation();
    } catch {
      // Even if the backend call fails (e.g. session already expired),
      // still drop the local override -- staying stuck impersonating
      // because of a network blip is worse than an unmatched end record.
    } finally {
      clearImpersonation();
      // Hard navigation -- this banner only re-reads sessionStorage on
      // mount, so a soft client-side nav would leave it showing "Viewing
      // as..." even though the override was just cleared.
      window.location.href = `/admin/profile/${targetId}`;
    }
  }

  return (
    <div className="sticky top-0 z-[60] bg-[#FF7A1A] text-white px-4 py-2.5 flex items-center justify-center gap-4 shadow-md">
      <p className="text-sm font-semibold">
        👁️ Viewing as {target.name} ({target.role}) — You are in admin view mode
      </p>
      <button
        onClick={handleExit}
        disabled={exiting}
        className="text-xs font-bold bg-white/20 hover:bg-white/30 disabled:opacity-60 px-3 py-1 rounded-full"
      >
        {exiting ? 'Exiting…' : 'Exit'}
      </button>
    </div>
  );
}

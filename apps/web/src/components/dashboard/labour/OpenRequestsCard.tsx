'use client';

import { useState } from 'react';
import { confirmBooking, cancelBooking, type Booking } from '@/lib/bookings';

// "Open requests" are this worker's own PENDING bookings -- a homeowner
// already picked them specifically. There's no broadcast/marketplace pool
// today, so Accept/Not interested just wrap the existing confirm/cancel
// flow rather than a new matching system.
export default function OpenRequestsCard({ bookings }: { bookings: Booking[] }) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);

  const requests = bookings
    .filter((b) => b.status === 'PENDING' && !hidden.has(b.id))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 10);

  async function handleAccept(id: string) {
    setBusy(id);
    try {
      await confirmBooking(id);
      setHidden((prev) => new Set(prev).add(id));
    } finally {
      setBusy(null);
    }
  }

  async function handleDecline(id: string) {
    setBusy(id);
    try {
      await cancelBooking(id);
      setHidden((prev) => new Set(prev).add(id));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div id="open-requests">
      <h3 className="text-sm font-bold text-[#2C1810] mb-3">📢 Open Requests</h3>
      {requests.length === 0 ? (
        <p className="text-sm text-[#A08070] bg-white rounded-2xl border border-[#EBE0D8] p-4 text-center">
          No open requests right now — check back soon
        </p>
      ) : (
        <div className="space-y-3">
          {requests.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-[#EBE0D8] p-4">
              <div className="flex items-center justify-between gap-3 mb-1">
                <p className="font-semibold text-sm text-[#2C1810]">{b.customer?.name ?? 'Customer'}</p>
                <p className="text-xs font-semibold text-[#9E3F24]">₹{Number(b.amount).toLocaleString('en-IN')}</p>
              </div>
              {b.notes && <p className="text-xs text-[#6B5248] mb-2">{b.notes}</p>}
              <p className="text-xs text-[#A08070] mb-3">
                📅 {new Date(b.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(b.id)}
                  disabled={busy === b.id}
                  className="flex-1 bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-60 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                >
                  ✓ Accept
                </button>
                <button
                  onClick={() => handleDecline(b.id)}
                  disabled={busy === b.id}
                  className="flex-1 border border-[#EBE0D8] text-[#6B5248] hover:bg-[#FDF8F5] disabled:opacity-60 text-xs font-semibold py-2 rounded-lg transition-colors"
                >
                  ✗ Not interested
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

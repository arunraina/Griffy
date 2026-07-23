'use client';

import { useEffect, useState } from 'react';
import type { UserState } from '@griffy/shared';
import type { Me } from '@/lib/users';
import { greeting, firstName } from '@/lib/dashboard';
import { fetchIncomingBookings, confirmBooking, cancelBooking, type Booking } from '@/lib/bookings';

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

function isSameLocalDate(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate();
}

function NewRequestCard({ booking, onAccept, onDecline, busy }: {
  booking: Booking; onAccept: () => void; onDecline: () => void; busy: boolean;
}) {
  const deadline = new Date(booking.createdAt).getTime() + TWO_HOURS_MS;
  const minutesLeft = Math.max(0, Math.round((deadline - Date.now()) / 60000));

  return (
    <div className="bg-white rounded-2xl border-2 border-[#C0593A] p-6 shadow-sm">
      <p className="text-sm font-bold text-[#C0593A] mb-3">🔔 NEW REQUEST!</p>
      <p className="text-lg font-bold text-[#2C1810] mb-1">{booking.customer?.name ?? 'Customer'}</p>
      <p className="text-sm text-[#6B5248] mb-1">
        📅 {new Date(booking.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
      </p>
      <p className="text-sm text-[#6B5248] mb-3">💰 ₹{Number(booking.amount).toLocaleString('en-IN')}</p>
      {booking.notes && (
        <p className="text-xs text-[#6B5248] bg-[#FDF8F5] rounded-lg p-3 mb-4">&ldquo;{booking.notes}&rdquo;</p>
      )}
      <div className="flex gap-3 mb-3">
        <button onClick={onAccept} disabled={busy} className="flex-1 bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-60 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
          ✓ Accept
        </button>
        <button onClick={onDecline} disabled={busy} className="flex-1 border border-[#EBE0D8] text-[#6B5248] hover:bg-[#FDF8F5] disabled:opacity-60 text-sm font-semibold py-2.5 rounded-xl transition-colors">
          ✗ Decline
        </button>
      </div>
      <p className="text-xs text-[#A08070] text-center">
        {minutesLeft > 0 ? `⏱ Respond within ${minutesLeft} min` : '⏱ Please respond soon'}
      </p>
    </div>
  );
}

export default function ServiceExpertActiveView({ me }: { state: UserState; me: Me }) {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetchIncomingBookings().then(setBookings);
  }, []);

  if (bookings === null) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] px-6 py-10">
        <div className="max-w-[700px] mx-auto animate-pulse space-y-4">
          <div className="h-6 w-48 bg-[#EBE0D8]/60 rounded-lg" />
          <div className="h-32 bg-[#EBE0D8]/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  async function respond(id: string, accept: boolean) {
    setBusyId(id);
    try {
      if (accept) await confirmBooking(id); else await cancelBooking(id);
      setBookings((prev) => prev && prev.filter((b) => b.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  const pending = bookings
    .filter((b) => b.status === 'PENDING')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const [newest, ...rest] = pending;

  const today = new Date();
  const todaysSchedule = bookings
    .filter((b) => (b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS') && isSameLocalDate(b.scheduledAt, today))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const totalEarned = bookings
    .filter((b) => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + Number(b.amount), 0);

  return (
    <div className="min-h-screen bg-[#FDF8F5] px-6 py-10">
      <div className="max-w-[700px] mx-auto space-y-6">
        <h1 className="text-xl font-bold text-[#2C1810]">{greeting()}, {firstName(me.name)}</h1>

        {newest && (
          <NewRequestCard
            booking={newest}
            busy={busyId === newest.id}
            onAccept={() => respond(newest.id, true)}
            onDecline={() => respond(newest.id, false)}
          />
        )}

        <div>
          <h3 className="text-sm font-bold text-[#2C1810] mb-3">📅 Today&apos;s Schedule</h3>
          {todaysSchedule.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#EBE0D8] p-4 text-center">
              <p className="text-sm text-[#6B5248] mb-1">No jobs scheduled today</p>
              <p className="text-xs text-[#A08070]">Share your profile to fill your day</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todaysSchedule.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl border border-[#EBE0D8] p-4 flex items-center justify-between gap-3">
                  <p className="font-semibold text-sm text-[#2C1810]">
                    {new Date(b.scheduledAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })} — {b.customer?.name ?? 'Customer'}
                  </p>
                  <p className="text-xs text-[#A08070] shrink-0">₹{Number(b.amount).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {rest.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-[#2C1810] mb-3">📢 Other Open Requests</h3>
            <div className="space-y-3">
              {rest.slice(0, 10).map((b) => (
                <div key={b.id} className="bg-white rounded-2xl border border-[#EBE0D8] p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="font-semibold text-sm text-[#2C1810]">{b.customer?.name ?? 'Customer'}</p>
                    <p className="text-xs font-semibold text-[#9E3F24]">₹{Number(b.amount).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => respond(b.id, true)} disabled={busyId === b.id} className="flex-1 bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-60 text-white text-xs font-bold py-2 rounded-lg transition-colors">
                      ✓ Accept
                    </button>
                    <button onClick={() => respond(b.id, false)} disabled={busyId === b.id} className="flex-1 border border-[#EBE0D8] text-[#6B5248] hover:bg-[#FDF8F5] disabled:opacity-60 text-xs font-semibold py-2 rounded-lg transition-colors">
                      ✗ Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-5">
          <h3 className="text-sm font-bold text-[#2C1810] mb-2">💰 Earnings</h3>
          <p className="text-lg font-bold text-[#2C1810]">₹{totalEarned.toLocaleString('en-IN')} total</p>
          {/* Breakdown by service type isn't buildable yet -- Booking has no
              link to which ServiceItem/category a job was for. Deferred
              until that's added, rather than faked from booking.notes. */}
        </div>
      </div>
    </div>
  );
}

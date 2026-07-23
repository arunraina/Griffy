'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Booking } from '@/lib/bookings';
import { startConversation } from '@/lib/chat';

const GOAL_KEY = 'griffy_labour_earnings_goal';

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default function LabourGrowthInsights({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const [goal, setGoal] = useState<number | null>(null);
  const [goalInput, setGoalInput] = useState('');
  const [messagingId, setMessagingId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(GOAL_KEY);
    if (stored) setGoal(Number(stored));
  }, []);

  function saveGoal() {
    const val = Number(goalInput);
    if (val > 0) {
      localStorage.setItem(GOAL_KEY, String(val));
      setGoal(val);
    }
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const workedDays = useMemo(() => {
    const set = new Set<number>();
    bookings
      .filter((b) => b.status === 'COMPLETED' || b.status === 'IN_PROGRESS' || b.status === 'CONFIRMED')
      .forEach((b) => {
        const d = new Date(b.scheduledAt);
        if (d >= monthStart && d.getMonth() === now.getMonth()) set.add(d.getDate());
      });
    return set;
  }, [bookings, monthStart, now]);

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthEarnings = bookings
    .filter((b) => b.status === 'COMPLETED' && new Date(b.updatedAt) >= monthStart)
    .reduce((sum, b) => sum + Number(b.amount), 0);

  // Same customer booked this worker 2+ times.
  const repeatCustomers = useMemo(() => {
    const byCustomer = new Map<string, { name: string; count: number }>();
    bookings.forEach((b) => {
      if (!b.customer) return;
      const existing = byCustomer.get(b.customerId);
      byCustomer.set(b.customerId, { name: b.customer.name, count: (existing?.count ?? 0) + 1 });
    });
    return [...byCustomer.entries()].filter(([, v]) => v.count >= 2);
  }, [bookings]);

  async function messageCustomer(customerId: string) {
    setMessagingId(customerId);
    try {
      const convo = await startConversation(customerId);
      router.push(`/messages/${convo.id}`);
    } finally {
      setMessagingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#EBE0D8] p-5">
        <h3 className="text-sm font-bold text-[#2C1810] mb-3">📆 Work Calendar — {now.toLocaleString('en-IN', { month: 'long' })}</h3>
        <p className="text-xs text-[#6B5248] mb-3">{workedDays.size}/{daysInMonth} working days booked this month</p>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
            <div
              key={day}
              className={`aspect-square rounded-lg flex items-center justify-center text-[11px] font-semibold ${
                workedDays.has(day) ? 'bg-[#C0593A] text-white' : 'bg-[#FDF8F5] text-[#A08070] border border-[#EBE0D8]'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EBE0D8] p-5">
        <h3 className="text-sm font-bold text-[#2C1810] mb-3">🎯 Earnings Goal</h3>
        {goal ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[#2C1810]">₹{monthEarnings.toLocaleString('en-IN')} earned</p>
              <p className="text-sm font-bold text-[#C0593A]">{Math.min(100, Math.round((monthEarnings / goal) * 100))}%</p>
            </div>
            <div className="h-2 bg-[#FAEEE9] rounded-full overflow-hidden">
              <div className="h-full bg-[#C0593A] rounded-full" style={{ width: `${Math.min(100, (monthEarnings / goal) * 100)}%` }} />
            </div>
            <p className="text-xs text-[#A08070] mt-2">Goal: ₹{goal.toLocaleString('en-IN')}/month</p>
          </>
        ) : (
          <div className="flex gap-2">
            <input
              type="number"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="e.g. 20000"
              className="flex-1 bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C0593A]"
            />
            <button onClick={saveGoal} className="bg-[#C0593A] hover:bg-[#9E3F24] text-white text-sm font-semibold px-4 rounded-lg transition-colors">
              Set Goal
            </button>
          </div>
        )}
      </div>

      {repeatCustomers.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-5">
          <h3 className="text-sm font-bold text-[#2C1810] mb-3">🔁 Repeat Customers</h3>
          <div className="space-y-2">
            {repeatCustomers.map(([customerId, info]) => (
              <div key={customerId} className="flex items-center justify-between gap-3">
                <p className="text-sm text-[#2C1810]">{info.name} — hired you {info.count} times</p>
                <button
                  onClick={() => messageCustomer(customerId)}
                  disabled={messagingId === customerId}
                  className="text-xs font-semibold text-[#C0593A] hover:underline disabled:opacity-60 whitespace-nowrap"
                >
                  Message them →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

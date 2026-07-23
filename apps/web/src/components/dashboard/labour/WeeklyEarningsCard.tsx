import type { Booking } from '@/lib/bookings';

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// Computed client-side from the same fetchIncomingBookings() payload already
// on hand -- UserState.totalEarned is lifetime-only, and a labour worker's
// booking volume is small enough that this is cheap. Revisit with a real
// backend aggregate only if that stops being true.
export default function WeeklyEarningsCard({ bookings }: { bookings: Booking[] }) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const thisWeekStart = new Date(todayStart.getTime() - todayStart.getDay() * DAY_MS);
  const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * DAY_MS);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const completed = bookings.filter((b) => b.status === 'COMPLETED');

  function sumSince(start: Date, end?: Date) {
    const inRange = completed.filter((b) => {
      const t = new Date(b.updatedAt).getTime();
      return t >= start.getTime() && (!end || t < end.getTime());
    });
    return {
      amount: inRange.reduce((sum, b) => sum + Number(b.amount), 0),
      days: new Set(inRange.map((b) => startOfDay(new Date(b.updatedAt)).getTime())).size,
    };
  }

  const thisWeek = sumSince(thisWeekStart);
  const lastWeek = sumSince(lastWeekStart, thisWeekStart);
  const thisMonth = sumSince(thisMonthStart);

  return (
    <div className="bg-white rounded-2xl border border-[#EBE0D8] p-5">
      <h3 className="text-sm font-bold text-[#2C1810] mb-3">💰 Weekly Earnings</h3>
      <div className="space-y-1.5 text-sm text-[#2C1810]">
        <p>This week: <span className="font-bold">₹{thisWeek.amount.toLocaleString('en-IN')}</span> earned ({thisWeek.days} day{thisWeek.days === 1 ? '' : 's'} worked)</p>
        <p className="text-[#6B5248]">Last week: ₹{lastWeek.amount.toLocaleString('en-IN')} ({lastWeek.days} day{lastWeek.days === 1 ? '' : 's'} worked)</p>
        <p className="text-[#6B5248]">This month: ₹{thisMonth.amount.toLocaleString('en-IN')}</p>
      </div>
    </div>
  );
}

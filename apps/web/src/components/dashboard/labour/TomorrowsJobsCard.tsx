import type { Booking } from '@/lib/bookings';

function isSameLocalDate(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate();
}

export default function TomorrowsJobsCard({ bookings }: { bookings: Booking[] }) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const jobs = bookings
    .filter((b) => (b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS') && isSameLocalDate(b.scheduledAt, tomorrow))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  return (
    <div>
      <h3 className="text-sm font-bold text-[#2C1810] mb-3">🗓️ Tomorrow&apos;s Jobs</h3>
      {jobs.length === 0 ? (
        <p className="text-sm text-[#A08070] bg-white rounded-2xl border border-[#EBE0D8] p-4 text-center">
          No jobs tomorrow yet
        </p>
      ) : (
        <div className="space-y-3">
          {jobs.map((b) => (
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
  );
}

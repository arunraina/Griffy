import Link from 'next/link';
import type { Booking } from '@/lib/bookings';

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
};

function isSameLocalDate(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate();
}

export default function TodaysJobsCard({ bookings }: { bookings: Booking[] }) {
  const today = new Date();
  const jobs = bookings
    .filter((b) => (b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS') && isSameLocalDate(b.scheduledAt, today))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  return (
    <div>
      <h3 className="text-sm font-bold text-[#2C1810] mb-3">📅 Today&apos;s Jobs</h3>
      {jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-4 text-center">
          <p className="text-sm text-[#6B5248] mb-2">No jobs today</p>
          <Link href="#open-requests" className="text-xs font-semibold text-[#C0593A] hover:underline">
            Check open requests →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-[#EBE0D8] p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="font-semibold text-sm text-[#2C1810]">
                  {new Date(b.scheduledAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })} — {b.customer?.name ?? 'Customer'}
                </p>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${STATUS_STYLES[b.status] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                  {b.status}
                </span>
              </div>
              {b.notes && <p className="text-xs text-[#6B5248] mb-2">{b.notes}</p>}
              <p className="text-xs text-[#A08070] mb-3">₹{Number(b.amount).toLocaleString('en-IN')} agreed</p>
              {b.customer?.phone && (
                <a href={`tel:${b.customer.phone}`} className="text-xs font-semibold text-[#C0593A] hover:underline">
                  📞 Call customer
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

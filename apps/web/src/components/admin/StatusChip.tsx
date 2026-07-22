import type { AccountStatus } from '@/lib/admin';

const STYLES: Record<AccountStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  SUSPENDED: 'bg-red-100 text-red-800 border-red-200',
  TEMP_SUSPENDED: 'bg-orange-100 text-orange-800 border-orange-200',
  RESTRICTED_LISTING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  RESTRICTED_BOOKING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  RESTRICTED_EXPLORE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PENDING_REVIEW: 'bg-blue-100 text-blue-800 border-blue-200',
};

function label(status: AccountStatus, expiresAt: string | null): string {
  switch (status) {
    case 'ACTIVE': return 'Active';
    case 'SUSPENDED': return 'Suspended';
    case 'TEMP_SUSPENDED':
      return expiresAt ? `Suspended until ${new Date(expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : 'Temp. suspended';
    case 'RESTRICTED_LISTING': return 'Listing restricted';
    case 'RESTRICTED_BOOKING': return 'Booking restricted';
    case 'RESTRICTED_EXPLORE': return 'Explore only';
    case 'PENDING_REVIEW': return 'Under review';
  }
}

export default function StatusChip({ status, expiresAt }: { status: AccountStatus; expiresAt: string | null }) {
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${STYLES[status]}`}>
      {label(status, expiresAt)}
    </span>
  );
}

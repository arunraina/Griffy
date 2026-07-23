'use client';

import { useEffect, useState } from 'react';
import type { UserState } from '@griffy/shared';
import type { Me } from '@/lib/users';
import { fetchIncomingBookings, type Booking } from '@/lib/bookings';
import LabourOnboarding from './LabourOnboarding';
import LabourDailyWorkView from './LabourDailyWorkView';
import LabourDrySpell from './LabourDrySpell';

const DRY_SPELL_DAYS = 5;

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
}

// L1 vs L2 vs L3 selection. L1/L2 use only UserState fields (no fetch
// needed for that decision); L3's dry-spell check needs real booking dates,
// so bookings are fetched once here and passed down to whichever view
// renders, rather than each screen re-fetching independently.
export default function LabourDashboardRouter({ state, me }: { state: UserState; me: Me }) {
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  useEffect(() => {
    if (state.hasBookings || state.pendingJobsCount > 0) {
      fetchIncomingBookings().then(setBookings);
    }
  }, [state.hasBookings, state.pendingJobsCount]);

  if (!state.hasBookings && state.pendingJobsCount === 0) {
    return <LabourOnboarding state={state} me={me} />;
  }

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

  const mostRecentActivity = bookings.reduce<string | null>((latest, b) => {
    if (!latest || new Date(b.createdAt) > new Date(latest)) return b.createdAt;
    return latest;
  }, null);
  const isDrySpell = state.pendingJobsCount === 0
    && (!mostRecentActivity || daysSince(mostRecentActivity) >= DRY_SPELL_DAYS);

  if (isDrySpell) {
    return <LabourDrySpell state={state} me={me} bookings={bookings} />;
  }
  return <LabourDailyWorkView state={state} me={me} bookings={bookings} />;
}

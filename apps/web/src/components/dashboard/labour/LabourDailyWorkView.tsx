'use client';

import { useEffect, useState } from 'react';
import type { UserState } from '@griffy/shared';
import type { Me } from '@/lib/users';
import { greeting, firstName } from '@/lib/dashboard';
import { fetchIncomingBookings, type Booking } from '@/lib/bookings';
import TodaysJobsCard from './TodaysJobsCard';
import TomorrowsJobsCard from './TomorrowsJobsCard';
import OpenRequestsCard from './OpenRequestsCard';
import WeeklyEarningsCard from './WeeklyEarningsCard';

export default function LabourDailyWorkView({ me }: { state: UserState; me: Me }) {
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  useEffect(() => {
    fetchIncomingBookings().then(setBookings);
  }, []);

  if (bookings === null) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] px-6 py-10">
        <div className="max-w-[700px] mx-auto animate-pulse space-y-4">
          <div className="h-6 w-48 bg-[#EBE0D8]/60 rounded-lg" />
          <div className="h-32 bg-[#EBE0D8]/60 rounded-2xl" />
          <div className="h-32 bg-[#EBE0D8]/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5] px-6 py-10">
      <div className="max-w-[700px] mx-auto space-y-6">
        <h1 className="text-xl font-bold text-[#2C1810]">{greeting()}, {firstName(me.name)}</h1>

        <TodaysJobsCard bookings={bookings} />
        <TomorrowsJobsCard bookings={bookings} />
        <OpenRequestsCard bookings={bookings} />
        <WeeklyEarningsCard bookings={bookings} />
      </div>
    </div>
  );
}

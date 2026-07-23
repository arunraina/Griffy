import type { UserState } from '@griffy/shared';
import type { Me } from '@/lib/users';
import type { Booking } from '@/lib/bookings';
import { greeting, firstName } from '@/lib/dashboard';
import { getSeasonalBanner } from '@/lib/labourProfiles';
import TodaysJobsCard from './TodaysJobsCard';
import TomorrowsJobsCard from './TomorrowsJobsCard';
import OpenRequestsCard from './OpenRequestsCard';
import WeeklyEarningsCard from './WeeklyEarningsCard';
import SeasonalBanner from './SeasonalBanner';
import LabourGrowthInsights from './LabourGrowthInsights';

const GROWING_THRESHOLD = 5;

export default function LabourDailyWorkView({ state, me, bookings }: { state: UserState; me: Me; bookings: Booking[] }) {
  const banner = getSeasonalBanner();

  return (
    <div className="min-h-screen bg-[#FDF8F5] px-6 py-10">
      <div className="max-w-[700px] mx-auto space-y-6">
        <h1 className="text-xl font-bold text-[#2C1810]">{greeting()}, {firstName(me.name)}</h1>

        {banner && <SeasonalBanner banner={banner} />}

        <TodaysJobsCard bookings={bookings} />
        <TomorrowsJobsCard bookings={bookings} />
        <OpenRequestsCard bookings={bookings} />
        <WeeklyEarningsCard bookings={bookings} />

        {state.totalCompletedJobs >= GROWING_THRESHOLD && (
          <LabourGrowthInsights bookings={bookings} />
        )}
      </div>
    </div>
  );
}

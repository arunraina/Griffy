import type { UserState } from '@griffy/shared';
import type { Me } from '@/lib/users';
import LabourOnboarding from './LabourOnboarding';
import LabourDailyWorkView from './LabourDailyWorkView';

// L1 vs L2 selection uses only fields UserState already computes for every
// role -- no new backend field needed for this decision itself (L3-L5 will
// add their own signals when those stages are built).
export default function LabourDashboardRouter({ state, me }: { state: UserState; me: Me }) {
  if (state.hasBookings || state.pendingJobsCount > 0) {
    return <LabourDailyWorkView state={state} me={me} />;
  }
  return <LabourOnboarding state={state} me={me} />;
}

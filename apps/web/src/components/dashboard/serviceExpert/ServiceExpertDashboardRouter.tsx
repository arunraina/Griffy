'use client';

import { useEffect, useState } from 'react';
import type { UserState } from '@griffy/shared';
import type { Me } from '@/lib/users';
import { fetchPublicServiceItems, type PublicServiceItem } from '@/lib/serviceItems';
import { fetchMyServiceExpertProfile, type MyServiceExpertProfile } from '@/lib/serviceExpertProfiles';
import ServiceExpertOnboarding from './ServiceExpertOnboarding';
import ServiceExpertActiveView from './ServiceExpertActiveView';

// SE1 vs SE3: a service menu (3+ ServiceItems) is the milestone that "opens"
// the active operations view, matching the spec's "after adding 3+ services,
// your service menu is live" framing.
const MENU_READY_THRESHOLD = 3;

export default function ServiceExpertDashboardRouter({ state, me }: { state: UserState; me: Me }) {
  const [profile, setProfile] = useState<MyServiceExpertProfile | null>(null);
  const [services, setServices] = useState<PublicServiceItem[] | null>(null);

  useEffect(() => {
    fetchMyServiceExpertProfile().then((p) => {
      setProfile(p);
      if (p) fetchPublicServiceItems('service-expert', p.id).then(setServices);
    });
  }, []);

  if (profile === null || services === null) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] px-6 py-10">
        <div className="max-w-[700px] mx-auto animate-pulse space-y-4">
          <div className="h-6 w-48 bg-[#EBE0D8]/60 rounded-lg" />
          <div className="h-32 bg-[#EBE0D8]/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (services.length < MENU_READY_THRESHOLD) {
    return <ServiceExpertOnboarding state={state} me={me} profile={profile} services={services} onServicesChange={setServices} />;
  }
  return <ServiceExpertActiveView state={state} me={me} />;
}

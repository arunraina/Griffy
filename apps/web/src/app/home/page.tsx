'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchMe, NotAuthenticatedError, type Me } from '@/lib/users';
import { fetchDashboardState, firstName } from '@/lib/dashboard';
import type { UserState } from '@griffy/shared';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import NewHomeownerWelcome from '@/components/dashboard/NewHomeownerWelcome';
import IdleHomeownerDashboard from '@/components/dashboard/IdleHomeownerDashboard';
import ActiveHomeownerDashboard from '@/components/dashboard/ActiveHomeownerDashboard';
import LabourDashboardRouter from '@/components/dashboard/labour/LabourDashboardRouter';
import ServiceExpertDashboardRouter from '@/components/dashboard/serviceExpert/ServiceExpertDashboardRouter';
import MaterialSupplierDashboardRouter from '@/components/dashboard/materialSupplier/MaterialSupplierDashboardRouter';

export default function HomePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [state, setState] = useState<UserState | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    Promise.all([fetchMe(), fetchDashboardState()])
      .then(([meData, stateData]) => {
        setMe(meData);
        setState(stateData);
      })
      .catch((e) => {
        if (e instanceof NotAuthenticatedError) router.replace('/login?redirect=/home');
        else setLoadError(true);
      });
  }, [router]);

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#2C1810] font-semibold mb-2">Could not load your dashboard.</p>
          <p className="text-sm text-[#6B5248]">Check your connection and try refreshing the page.</p>
        </div>
      </div>
    );
  }

  if (!me || !state) return <DashboardSkeleton />;

  if (state.role === 'LABOUR') {
    return <LabourDashboardRouter state={state} me={me} />;
  }

  if (state.role === 'SERVICE_EXPERT') {
    return <ServiceExpertDashboardRouter state={state} me={me} />;
  }

  if (state.role === 'MATERIAL_SUPPLIER') {
    return <MaterialSupplierDashboardRouter state={state} me={me} />;
  }

  // Every other role still falls back to the existing tabbed /dashboard
  // until their own stage lands (see the 9-stage supply-side journey plan).
  if (state.role !== 'HOMEOWNER') {
    router.replace('/dashboard');
    return <DashboardSkeleton />;
  }

  const name = firstName(me.name);

  if (state.isFirstLogin && !state.hasBookings && !state.hasOrders) {
    return <NewHomeownerWelcome state={state} name={name} />;
  }
  if (state.activeBookingsCount > 0 || state.activeOrdersCount > 0) {
    return <ActiveHomeownerDashboard state={state} name={name} />;
  }
  return <IdleHomeownerDashboard state={state} name={name} />;
}

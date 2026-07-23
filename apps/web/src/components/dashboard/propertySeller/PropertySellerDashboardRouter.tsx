'use client';

import { useEffect, useState } from 'react';
import type { UserState } from '@griffy/shared';
import type { Me } from '@/lib/users';
import { fetchMyProperties, type PropertyListing } from '@/lib/properties';
import PropertySellerOnboarding from './PropertySellerOnboarding';
import PropertySellerActiveView from './PropertySellerActiveView';

export default function PropertySellerDashboardRouter({ state, me }: { state: UserState; me: Me }) {
  const [properties, setProperties] = useState<PropertyListing[] | null>(null);

  useEffect(() => {
    fetchMyProperties().then(setProperties);
  }, []);

  if (properties === null) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] px-6 py-10">
        <div className="max-w-[700px] mx-auto animate-pulse space-y-4">
          <div className="h-6 w-48 bg-[#EBE0D8]/60 rounded-lg" />
          <div className="h-32 bg-[#EBE0D8]/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  const activeListings = properties.filter((p) => p.isAvailable);
  if (activeListings.length === 0) {
    return <PropertySellerOnboarding state={state} me={me} onCreated={(p) => setProperties([...properties, p])} />;
  }
  return <PropertySellerActiveView state={state} me={me} properties={activeListings} onPropertiesChange={setProperties} allProperties={properties} />;
}

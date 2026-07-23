'use client';

import { useEffect, useState } from 'react';
import type { UserState } from '@griffy/shared';
import type { Me } from '@/lib/users';
import { fetchMyMaterials, type Material } from '@/lib/materials';
import MaterialSupplierOnboarding from './MaterialSupplierOnboarding';
import MaterialSupplierActiveView from './MaterialSupplierActiveView';

export default function MaterialSupplierDashboardRouter({ state, me }: { state: UserState; me: Me }) {
  const [materials, setMaterials] = useState<Material[] | null>(null);

  useEffect(() => {
    fetchMyMaterials().then(setMaterials);
  }, []);

  if (materials === null) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] px-6 py-10">
        <div className="max-w-[700px] mx-auto animate-pulse space-y-4">
          <div className="h-6 w-48 bg-[#EBE0D8]/60 rounded-lg" />
          <div className="h-32 bg-[#EBE0D8]/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (materials.length === 0) {
    return <MaterialSupplierOnboarding state={state} me={me} materials={materials} onMaterialsChange={setMaterials} />;
  }
  return <MaterialSupplierActiveView state={state} me={me} materials={materials} onMaterialsChange={setMaterials} />;
}

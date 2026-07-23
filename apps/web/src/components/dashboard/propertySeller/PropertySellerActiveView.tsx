'use client';

import { useEffect, useState } from 'react';
import type { UserState } from '@griffy/shared';
import type { Me } from '@/lib/users';
import { greeting, firstName } from '@/lib/dashboard';
import { updateMyProperty, type PropertyListing } from '@/lib/properties';
import { fetchReceivedEnquiries, updateEnquiryStatus, type Enquiry } from '@/lib/enquiries';

export default function PropertySellerActiveView({
  me, properties, onPropertiesChange, allProperties,
}: {
  state: UserState; me: Me; properties: PropertyListing[]; allProperties: PropertyListing[];
  onPropertiesChange: (properties: PropertyListing[]) => void;
}) {
  const [enquiries, setEnquiries] = useState<Enquiry[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetchReceivedEnquiries().then(setEnquiries);
  }, []);

  const propertyIds = new Set(properties.map((p) => p.id));
  const myEnquiries = (enquiries ?? []).filter((e) => e.propertyId && propertyIds.has(e.propertyId));

  async function markSold(property: PropertyListing) {
    setBusyId(property.id);
    try {
      const updated = await updateMyProperty(property.id, { isAvailable: false });
      onPropertiesChange(allProperties.map((p) => (p.id === updated.id ? updated : p)));
    } finally {
      setBusyId(null);
    }
  }

  async function respondToEnquiry(id: string, status: 'CONTACTED' | 'CLOSED') {
    setBusyId(id);
    try {
      const updated = await updateEnquiryStatus(id, status);
      setEnquiries((prev) => prev && prev.map((e) => (e.id === id ? updated : e)));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5] px-6 py-10">
      <div className="max-w-[700px] mx-auto space-y-6">
        <h1 className="text-xl font-bold text-[#2C1810]">{greeting()}, {firstName(me.name)}</h1>

        {properties.map((p) => {
          const enqCount = myEnquiries.filter((e) => e.propertyId === p.id).length;
          return (
            <div key={p.id} className="bg-white rounded-2xl border border-[#EBE0D8] p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="font-bold text-sm text-[#2C1810]">{p.title}</p>
                <button
                  onClick={() => markSold(p)}
                  disabled={busyId === p.id}
                  className="text-xs font-semibold text-[#C0593A] hover:underline disabled:opacity-60 whitespace-nowrap"
                >
                  Mark as sold →
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-[#FDF8F5] rounded-xl py-3">
                  <p className="text-lg font-bold text-[#2C1810]">{p.viewCount}</p>
                  <p className="text-[10px] text-[#A08070] uppercase">Views</p>
                </div>
                <div className="bg-[#FDF8F5] rounded-xl py-3">
                  <p className="text-lg font-bold text-[#2C1810]">{enqCount}</p>
                  <p className="text-[10px] text-[#A08070] uppercase">Enquiries</p>
                </div>
              </div>
              {p.viewCount > 50 && enqCount < 3 && (
                <p className="text-xs text-[#9E3F24] bg-[#FAEEE9] rounded-lg px-3 py-2 mt-3">
                  High views but few enquiries — check if your price is competitive or add more photos.
                </p>
              )}
            </div>
          );
        })}

        <div>
          <h3 className="text-sm font-bold text-[#2C1810] mb-3">💬 Enquiries</h3>
          {myEnquiries.length === 0 ? (
            <p className="text-sm text-[#A08070] bg-white rounded-2xl border border-[#EBE0D8] p-4 text-center">No enquiries yet</p>
          ) : (
            <div className="space-y-3">
              {myEnquiries.map((e) => (
                <div key={e.id} className="bg-white rounded-2xl border border-[#EBE0D8] p-4">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <p className="font-semibold text-sm text-[#2C1810]">{e.enquirer?.name ?? 'Interested buyer'}</p>
                    <span className="text-[10px] font-semibold text-[#9E3F24] bg-[#FAEEE9] px-2 py-0.5 rounded-full">{e.status}</span>
                  </div>
                  <p className="text-xs text-[#6B5248] mb-3">&ldquo;{e.message}&rdquo;</p>
                  {e.status === 'NEW' && (
                    <div className="flex gap-2">
                      <button onClick={() => respondToEnquiry(e.id, 'CONTACTED')} disabled={busyId === e.id}
                        className="text-xs font-semibold text-[#C0593A] hover:underline disabled:opacity-60">Mark contacted →</button>
                      <button onClick={() => respondToEnquiry(e.id, 'CLOSED')} disabled={busyId === e.id}
                        className="text-xs font-semibold text-[#6B5248] hover:underline disabled:opacity-60">Not interested</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

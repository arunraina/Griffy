'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchMyLands, type Land } from '@/lib/lands';
import { fetchMyProperties, type PropertyListing } from '@/lib/properties';
import { SkeletonListRows } from '@/components/Skeleton';

type Listing = (Land | PropertyListing) & { kind: 'land' | 'property' };

export default function ListingsTab({ kind }: { kind: 'land' | 'property' | 'unavailable' }) {
  const [listings, setListings] = useState<Listing[] | null>(null);

  useEffect(() => {
    if (kind === 'land') {
      fetchMyLands().then((rows) => setListings(rows.map((r) => ({ ...r, kind: 'land' as const })))).catch(() => setListings([]));
    } else if (kind === 'property') {
      fetchMyProperties().then((rows) => setListings(rows.map((r) => ({ ...r, kind: 'property' as const })))).catch(() => setListings([]));
    }
  }, [kind]);

  if (kind === 'unavailable') {
    return (
      <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
        <p className="text-4xl mb-3">🚧</p>
        <p className="font-semibold text-[#2C1810] mb-1">Coming soon</p>
        <p className="text-sm text-[#6B5248]">Listing management for this role isn&apos;t built yet.</p>
      </div>
    );
  }

  if (listings === null) {
    return <SkeletonListRows count={3} />;
  }

  if (listings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
        <p className="text-4xl mb-3">{kind === 'land' ? '🌍' : '🏠'}</p>
        <p className="font-semibold text-[#2C1810] mb-1">No listings yet</p>
        <p className="text-sm text-[#6B5248] mb-4">
          Self-serve listing creation isn&apos;t live yet — email us and our team will get your first {kind === 'land' ? 'land or plot' : 'property'} listing up.
        </p>
        <Link href="/contact" className="inline-block text-sm font-semibold text-[#C0593A] border border-[#C0593A] px-4 py-2 rounded-lg hover:bg-[#FAEEE9]">
          Contact Us
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {listings.map((l) => (
        <Link key={l.id} href={`/${kind === 'land' ? 'land' : 'properties'}/${l.id}`}
          className="block bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-4 hover:border-[#D8B8A8] transition-colors">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#2C1810] truncate">{l.title}</p>
              <p className="text-xs text-[#A08070]">{l.city}, {l.state} · {Number(l.areaSqFt).toLocaleString('en-IN')} sqft</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-[#2C1810]">₹{Number(l.price).toLocaleString('en-IN')}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${l.isAvailable ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {l.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

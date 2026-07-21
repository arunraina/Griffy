'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

interface ContractorCard {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  contractorType: string;
  avgRating: number;
  totalReviews: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProfile(p: any): ContractorCard {
  return {
    id: p.id,
    userId: p.user?.id ?? p.userId,
    name: p.user?.name ?? 'Unknown',
    avatarUrl: p.user?.avatarUrl ?? null,
    contractorType: p.contractorType ?? '',
    avgRating: Number(p.avgRating ?? 0),
    totalReviews: p.totalReviews ?? 0,
  };
}

export default function PopularContractors({ city }: { city: string | null }) {
  const [contractors, setContractors] = useState<ContractorCard[]>([]);

  useEffect(() => {
    const target = city || 'Srinagar';
    fetch(`${API}/contractor-profiles?city=${encodeURIComponent(target)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setContractors((data ?? []).slice(0, 3).map(mapProfile)))
      .catch(() => setContractors([]));
  }, [city]);

  if (contractors.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-bold text-[#2C1810] mb-3">
        Popular contractors in {city || 'Srinagar'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {contractors.map((c) => (
          <Link key={c.id} href={`/contractors/${c.id}`}
            className="bg-white rounded-xl border border-[#EBE0D8] p-4 hover:border-[#C0593A] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FAEEE9] flex items-center justify-center text-[#C0593A] font-bold shrink-0">
                {c.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[#2C1810] truncate">{c.name}</p>
                <p className="text-xs text-[#A08070]">
                  ⭐ {c.avgRating.toFixed(1)} ({c.totalReviews})
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

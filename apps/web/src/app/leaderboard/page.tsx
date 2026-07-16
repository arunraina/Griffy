'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTier, jobsToNextTier, TIERS } from '@/lib/gamification';
import TierBadge from '@/components/TierBadge';
import BadgeRow from '@/components/BadgeRow';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
const MEDAL = ['🥇', '🥈', '🥉'];

interface Row {
  id: string;
  name: string;
  subtitle: string;
  location: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  unitLabel: string;
  verified: boolean;
  href: string;
}

type Tab = 'contractors' | 'labour' | 'service-experts' | 'material-sellers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapContractor(p: any): Row {
  return {
    id: p.id,
    name: p.user?.name ?? 'Unknown',
    subtitle: p.contractorType ?? 'Contractor',
    location: p.serviceCities?.[0] ?? '',
    rating: Number(p.avgRating ?? 0),
    reviewCount: p.totalReviews ?? 0,
    completedJobs: p.totalJobs ?? 0,
    unitLabel: 'job',
    verified: p.approvalStatus === 'APPROVED',
    href: `/contractors/${p.id}`,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLabour(p: any): Row {
  return {
    id: p.id,
    name: p.user?.name ?? 'Unknown',
    subtitle: p.skillType ?? 'Labour',
    location: p.serviceCities?.[0] ?? '',
    rating: Number(p.avgRating ?? 0),
    reviewCount: p.totalReviews ?? 0,
    completedJobs: p.totalJobs ?? 0,
    unitLabel: 'job',
    verified: p.approvalStatus === 'APPROVED',
    href: `/labour/${p.id}`,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapServiceExpert(p: any): Row {
  return {
    id: p.id,
    name: p.user?.name ?? 'Unknown',
    subtitle: p.expertiseType ?? 'Service Expert',
    location: p.serviceCities?.[0] ?? '',
    rating: Number(p.avgRating ?? 0),
    reviewCount: p.totalReviews ?? 0,
    completedJobs: p.totalJobs ?? 0,
    unitLabel: 'consult',
    verified: p.approvalStatus === 'APPROVED',
    href: `/service-experts/${p.id}`,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMaterialSeller(p: any): Row {
  return {
    id: p.id,
    name: p.businessName ?? p.user?.name ?? 'Unknown',
    subtitle: 'Material Supplier',
    location: p.deliveryCities?.[0] ?? '',
    rating: Number(p.avgRating ?? 0),
    reviewCount: p.totalReviews ?? 0,
    completedJobs: p.totalOrders ?? 0,
    unitLabel: 'order',
    verified: p.approvalStatus === 'APPROVED',
    href: `/materials`,
  };
}

function rankScore(r: Row): number {
  const tierIndex = TIERS.findIndex((t) => t.id === getTier(r.completedJobs, r.rating).id);
  return tierIndex * 100000 + r.completedJobs * 10 + r.rating;
}

function LeaderboardRow({ row, rank }: { row: Row; rank: number }) {
  const progress = jobsToNextTier(row.completedJobs, row.rating);
  return (
    <Link
      href={row.href}
      className="flex items-center gap-4 bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-4 hover:border-[#D8B8A8] hover:shadow-md transition-all"
    >
      <div className="w-8 text-center shrink-0">
        {rank <= 3 ? <span className="text-xl">{MEDAL[rank - 1]}</span> : <span className="text-sm font-extrabold text-[#D8C4B8]">#{rank}</span>}
      </div>
      <div className="w-11 h-11 rounded-xl bg-[#FAEEE9] border border-[#E8C4B0] flex items-center justify-center text-sm font-bold text-[#9E3F24] shrink-0">
        {row.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="font-semibold text-sm text-[#2C1810] truncate">{row.name}</p>
          {row.verified && <span className="text-blue-500 text-xs" title="Verified">✓</span>}
          <TierBadge completedJobs={row.completedJobs} rating={row.rating} />
        </div>
        <p className="text-xs text-[#A08070] mt-0.5">
          {row.subtitle}{row.location && ` · ${row.location}`}
        </p>
        {progress && (
          <p className="text-[11px] text-[#C0593A] font-medium mt-1">
            {progress.jobsLeft} more {row.unitLabel}{progress.jobsLeft !== 1 ? 's' : ''} to {progress.next.emoji} {progress.next.label}
          </p>
        )}
        <div className="mt-1.5">
          <BadgeRow verified={row.verified} completedJobs={row.completedJobs} rating={row.rating} reviewCount={row.reviewCount} />
        </div>
      </div>
      <div className="flex flex-col items-end shrink-0 gap-0.5">
        {row.rating > 0 && (
          <span className="text-sm font-bold text-[#2C1810]">★ {row.rating.toFixed(1)} <span className="text-xs text-[#A08070] font-normal">({row.reviewCount})</span></span>
        )}
        <span className="text-xs text-[#A08070]">{row.completedJobs} {row.unitLabel}{row.completedJobs !== 1 ? 's' : ''}</span>
      </div>
    </Link>
  );
}

const TABS: { id: Tab; label: string; icon: string; unitLabel: string }[] = [
  { id: 'contractors', label: 'Contractors', icon: '🏗️', unitLabel: 'job' },
  { id: 'labour', label: 'Labour', icon: '👷', unitLabel: 'job' },
  { id: 'service-experts', label: 'Service Experts', icon: '🧰', unitLabel: 'consult' },
  { id: 'material-sellers', label: 'Material Sellers', icon: '📦', unitLabel: 'order' },
];

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>('contractors');
  const [contractors, setContractors] = useState<Row[]>([]);
  const [labour, setLabour] = useState<Row[]>([]);
  const [serviceExperts, setServiceExperts] = useState<Row[]>([]);
  const [materialSellers, setMaterialSellers] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/contractor-profiles`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API}/labour-profiles`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API}/service-expert-profiles`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API}/material-supplier-profiles`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]).then(([c, l, se, ms]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setContractors((c ?? []).map(mapContractor).sort((a: Row, b: Row) => rankScore(b) - rankScore(a)));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setLabour((l ?? []).map(mapLabour).sort((a: Row, b: Row) => rankScore(b) - rankScore(a)));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setServiceExperts((se ?? []).map(mapServiceExpert).sort((a: Row, b: Row) => rankScore(b) - rankScore(a)));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setMaterialSellers((ms ?? []).map(mapMaterialSeller).sort((a: Row, b: Row) => rankScore(b) - rankScore(a)));
      setLoading(false);
    });
  }, []);

  const rows = { contractors, labour, 'service-experts': serviceExperts, 'material-sellers': materialSellers }[tab];

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#FAEEE9] text-[#9E3F24] text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            🏆 Leaderboard
          </div>
          <h1 className="text-2xl font-bold text-[#2C1810] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Griffy&apos;s Top-Rated Pros
          </h1>
          <p className="text-[#6B5248] text-sm">Ranked by completed jobs and customer ratings.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${tab === t.id ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8]'}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-[#A08070] text-sm">Loading leaderboard…</p>
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
            <p className="text-4xl mb-3">🏆</p>
            <p className="font-semibold text-[#2C1810] mb-1">No rankings yet</p>
            <p className="text-sm text-[#6B5248]">Check back once professionals start completing jobs on Griffy.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row, i) => (
              <LeaderboardRow key={row.id} row={row} rank={i + 1} />
            ))}
          </div>
        )}

        <div className="mt-8 bg-white rounded-2xl border border-[#EBE0D8] p-5">
          <p className="text-sm font-bold text-[#2C1810] mb-3">Tiers</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TIERS.map((t) => (
              <div key={t.id} className="text-center">
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${t.color} ${t.borderColor}`}>
                  {t.emoji} {t.label}
                </span>
                <p className="text-[11px] text-[#A08070] mt-1.5">{t.minJobs}+ {TABS.find((x) => x.id === tab)?.unitLabel}{t.minJobs !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

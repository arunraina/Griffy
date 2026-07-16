'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchMyTurnkeyProjects, fetchAssignedTurnkeyProjects, type TurnkeyProjectSummary } from '@/lib/turnkey';
import { NotAuthenticatedError } from '@/lib/users';
import { SkeletonListRows } from '@/components/Skeleton';

const STATUS_STYLE: Record<string, string> = {
  REQUESTED: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  ACCEPTED: 'bg-blue-50 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
};

type Tab = 'mine' | 'assigned';

export default function TurnkeyProjectsPage() {
  const [tab, setTab] = useState<Tab>('mine');
  const [mine, setMine] = useState<TurnkeyProjectSummary[] | null>(null);
  const [assigned, setAssigned] = useState<TurnkeyProjectSummary[] | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);

  useEffect(() => {
    fetchMyTurnkeyProjects().then(setMine).catch((e) => { if (e instanceof NotAuthenticatedError) setNeedsAuth(true); });
    fetchAssignedTurnkeyProjects().then(setAssigned).catch(() => undefined);
  }, []);

  if (needsAuth) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#2C1810] font-semibold mb-4">Log in to view your turnkey projects.</p>
          <Link href="/login?redirect=/turnkey-projects" className="text-[#C0593A] hover:underline font-semibold">Log In →</Link>
        </div>
      </div>
    );
  }

  const projects = tab === 'mine' ? mine : assigned;

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#2C1810] mb-1" style={{ fontFamily: 'Georgia, serif' }}>Turnkey Projects</h1>
          <p className="text-[#6B5248] text-sm">Full-service projects with milestone-based payment release — hire a specific contractor or builder directly, rather than open bidding.</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('mine')}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${tab === 'mine' ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8]'}`}>
            My Requests
          </button>
          <button onClick={() => setTab('assigned')}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${tab === 'assigned' ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8]'}`}>
            Assigned to Me
          </button>
        </div>

        {!projects ? (
          <SkeletonListRows count={4} />
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
            <p className="text-4xl mb-3">🏗️</p>
            <p className="font-semibold text-[#2C1810] mb-1">
              {tab === 'mine' ? 'No turnkey project requests yet' : 'No projects assigned to you yet'}
            </p>
            <p className="text-sm text-[#6B5248]">
              {tab === 'mine'
                ? 'Request a turnkey project from a contractor or builder’s profile page.'
                : 'When a homeowner requests a full-service project directly from your profile, it’ll show up here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => {
              const other = tab === 'mine' ? p.provider : p.customer;
              return (
                <Link key={p.id} href={`/turnkey-projects/${p.id}`}
                  className="block bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5 hover:border-[#D8B8A8] transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-semibold text-sm text-[#2C1810]">{p.title}</p>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${STATUS_STYLE[p.status]}`}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-[#A08070] mb-3">
                    {tab === 'mine' ? 'Provider' : 'Customer'}: {other?.name ?? '—'}
                  </p>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden mb-2">
                    <div className="bg-[#C0593A] h-full rounded-full" style={{ width: `${p.percentComplete}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#A08070]">
                    <span>{p.percentComplete}% complete</span>
                    <span className="font-semibold text-[#C0593A]">₹{Number(p.budget).toLocaleString('en-IN')}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

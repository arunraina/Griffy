'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAdminSummary, type AdminSummary } from '@/lib/admin';

const QUICK_LINKS = [
  { href: '/admin/metrics', icon: '📈', label: 'Growth Metrics', desc: 'Signups, GMV, bookings, and active supply — last 30 days and all-time.' },
  { href: '/admin/approvals', icon: '✅', label: 'Profile Approvals', desc: 'Review pending contractors, suppliers, and other professional profiles.' },
  { href: '/admin/kyc', icon: '🪪', label: 'KYC Review', desc: 'Manual identity and bank verification ahead of escrow payouts.' },
  { href: '/admin/moderation', icon: '🚩', label: 'Content Moderation', desc: 'Hide or demote spam/low-quality reviews, projects, and listings.' },
  { href: '/admin/reports', icon: '⚑', label: 'User Reports', desc: 'Profiles and listings flagged by users via the Report button.' },
  { href: '/admin/users', icon: '👥', label: 'Users', desc: 'Search users and suspend/unsuspend accounts.' },
  { href: '/admin/projects', icon: '🏗️', label: 'Posted Projects', desc: 'Manage the open project bidding marketplace.' },
  { href: '/admin/careers', icon: '💼', label: 'Career Applications', desc: 'Internship applications submitted via the Careers page.' },
  { href: '/admin/early-access', icon: '🚀', label: 'Early Access Signups', desc: 'Email waitlist for the mobile app.' },
  { href: '/admin/flags', icon: '🎛️', label: 'Feature Flags', desc: 'Read-only view of which marketplace verticals are enabled.' },
];

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminSummary()
      .then(setSummary)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  const hiddenTotal = summary ? Object.values(summary.hiddenContent).reduce((a, b) => a + b, 0) : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#2C1810]">Admin Dashboard</h1>
        <p className="text-sm text-[#6B5248] mt-0.5">Platform-wide overview across approvals, moderation, and growth.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon="⏳" value={summary?.totalPendingApprovals} label="Pending approvals" href="/admin/approvals" highlight={!!summary?.totalPendingApprovals} />
        <StatCard icon="🪪" value={summary?.kycPending} label="KYC pending" href="/admin/kyc" highlight={!!summary?.kycPending} />
        <StatCard icon="🚩" value={hiddenTotal} label="Hidden items" href="/admin/moderation" />
        <StatCard icon="💼" value={summary?.careerApplications} label="Career applications" href="/admin/careers" />
        <StatCard icon="🚀" value={summary?.earlyAccessSignups} label="Early access signups" href="/admin/early-access" />
      </div>

      {summary && summary.totalPendingApprovals > 0 && (
        <div className="bg-white border border-[#EBE0D8] rounded-2xl p-5 mb-8">
          <p className="text-sm font-bold text-[#2C1810] mb-3">Pending approvals by type</p>
          <div className="flex flex-wrap gap-2">
            {summary.pendingApprovals.filter((p) => p.pending > 0).map((p) => (
              <Link key={p.type} href={`/admin/approvals?type=${p.type}`}
                className="text-xs font-semibold bg-[#FAEEE9] text-[#9E3F24] px-3 py-1.5 rounded-full hover:bg-[#F0D8CC] transition-colors">
                {p.type} · {p.pending}
              </Link>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs font-bold text-[#A08070] uppercase tracking-wide mb-3">Quick links</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {QUICK_LINKS.map((l) => (
          <Link key={l.href} href={l.href}
            className="bg-white border border-[#EBE0D8] rounded-2xl p-5 hover:border-[#D8B8A8] hover:shadow-sm transition-all">
            <span className="text-2xl mb-2 block">{l.icon}</span>
            <p className="font-bold text-[#2C1810] text-sm mb-1">{l.label}</p>
            <p className="text-xs text-[#6B5248] leading-relaxed">{l.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, href, highlight }: { icon: string; value?: number; label: string; href: string; highlight?: boolean }) {
  return (
    <Link href={href} className={`bg-white border rounded-2xl p-5 hover:shadow-sm transition-all ${highlight ? 'border-[#C0593A]' : 'border-[#EBE0D8]'}`}>
      <span className="text-2xl mb-2 block">{icon}</span>
      <p className="text-2xl font-bold text-[#2C1810]">{value ?? '—'}</p>
      <p className="text-xs text-[#6B5248] mt-0.5">{label}</p>
    </Link>
  );
}

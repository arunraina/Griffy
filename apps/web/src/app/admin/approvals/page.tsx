'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  fetchAdminProfiles, approveProfile, rejectProfile,
  PROFILE_TYPE_LABELS, type ProfileType,
} from '@/lib/admin';
import { SkeletonListRows } from '@/components/Skeleton';

const PROFILE_TYPES = Object.keys(PROFILE_TYPE_LABELS) as ProfileType[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

function isValidType(t: string | null): t is ProfileType {
  return !!t && (PROFILE_TYPES as string[]).includes(t);
}

function ApprovalsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initial = searchParams.get('type');
  const [type, setType] = useState<ProfileType>(isValidType(initial) ? initial : 'contractor');
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'all'>('PENDING');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchAdminProfiles(type, statusFilter === 'all' ? undefined : statusFilter)
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [type, statusFilter]);

  useEffect(() => { load(); }, [load]);

  function selectType(t: ProfileType) {
    setType(t);
    router.replace(`/admin/approvals?type=${t}`);
  }

  async function handleApprove(id: string) {
    setUpdating(id);
    try {
      await approveProfile(type, id);
      load();
    } catch {
      /* leave state; admin can retry */
    } finally {
      setUpdating(null);
    }
  }

  async function handleReject(id: string) {
    const reason = window.prompt('Rejection reason (shown to the applicant):') ?? undefined;
    setUpdating(id);
    try {
      await rejectProfile(type, id, reason);
      load();
    } catch {
      /* leave state; admin can retry */
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#2C1810]">Profile Approvals</h1>
        <p className="text-sm text-[#6B5248] mt-0.5">Review professional and supplier profiles before they go live.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {PROFILE_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => selectType(t)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${type === t ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8]'}`}
          >
            {PROFILE_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-5">
        {(['PENDING', 'APPROVED', 'REJECTED', 'all'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${statusFilter === s ? 'bg-[#2C1810] text-white border-[#2C1810]' : 'bg-white text-[#6B5248] border-[#EBE0D8]'}`}
          >
            {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
      )}

      {loading ? (
        <SkeletonListRows count={6} />
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-semibold text-[#2C1810]">Nothing here</p>
        </div>
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {rows.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[#2C1810]">{r.user?.name ?? r.businessName ?? '—'}</p>
                    {r.businessName && r.user?.name && <p className="text-xs text-[#A08070]">{r.businessName}</p>}
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${
                    r.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-800 border-green-200'
                    : r.approvalStatus === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-200'
                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  }`}>
                    {r.approvalStatus}
                  </span>
                </div>
                <div className="text-sm text-[#6B5248] mt-1.5">
                  {r.user?.email && <p>{r.user.email}</p>}
                  {r.user?.phone && <p className="text-xs text-[#A08070]">{r.user.phone}</p>}
                </div>
                {r.rejectionReason && <p className="text-xs text-[#A08070] mt-1">{r.rejectionReason}</p>}
                <p className="text-xs text-[#A08070] mt-1">
                  Applied {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : '—'}
                </p>
                <div className="flex gap-4 mt-3 pt-3 border-t border-[#F0E8E2]">
                  {r.approvalStatus !== 'APPROVED' && (
                    <button
                      onClick={() => handleApprove(r.id)}
                      disabled={updating === r.id}
                      className="text-xs font-semibold text-green-700 hover:underline disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                  {r.approvalStatus !== 'REJECTED' && (
                    <button
                      onClick={() => handleReject(r.id)}
                      disabled={updating === r.id}
                      className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block bg-white rounded-2xl border border-[#EBE0D8] shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EBE0D8] text-left text-xs text-[#A08070] uppercase tracking-wide">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Applied</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-[#F0E8E2] last:border-none">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-[#2C1810]">{r.user?.name ?? r.businessName ?? '—'}</p>
                      {r.businessName && r.user?.name && <p className="text-xs text-[#A08070]">{r.businessName}</p>}
                    </td>
                    <td className="px-5 py-3 text-[#6B5248]">
                      {r.user?.email && <p>{r.user.email}</p>}
                      {r.user?.phone && <p className="text-xs text-[#A08070]">{r.user.phone}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                        r.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-800 border-green-200'
                        : r.approvalStatus === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}>
                        {r.approvalStatus}
                      </span>
                      {r.rejectionReason && <p className="text-xs text-[#A08070] mt-1 max-w-[200px]">{r.rejectionReason}</p>}
                    </td>
                    <td className="px-5 py-3 text-[#6B5248] text-xs">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-3">
                        {r.approvalStatus !== 'APPROVED' && (
                          <button
                            onClick={() => handleApprove(r.id)}
                            disabled={updating === r.id}
                            className="text-xs font-semibold text-green-700 hover:underline disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}
                        {r.approvalStatus !== 'REJECTED' && (
                          <button
                            onClick={() => handleReject(r.id)}
                            disabled={updating === r.id}
                            className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminApprovalsPage() {
  return (
    <Suspense>
      <ApprovalsInner />
    </Suspense>
  );
}

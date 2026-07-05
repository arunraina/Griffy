'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAdminKyc, verifyKyc, rejectKyc, type AdminKycDetail } from '@/lib/admin';

type Tab = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'all';

const STATUS_BADGE: Record<AdminKycDetail['status'], string> = {
  NOT_SUBMITTED: 'bg-gray-100 text-gray-600 border-gray-200',
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  VERIFIED: 'bg-green-50 text-green-700 border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

export default function AdminKycPage() {
  const [tab, setTab] = useState<Tab>('PENDING');
  const [rows, setRows] = useState<AdminKycDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchAdminKyc(tab === 'all' ? undefined : tab)
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  async function handleVerify(userId: string) {
    setUpdating(userId);
    try { await verifyKyc(userId); load(); } catch { /* retry available */ } finally { setUpdating(null); }
  }

  async function handleReject(userId: string) {
    const reason = window.prompt('Rejection reason (shown to the user):') ?? undefined;
    setUpdating(userId);
    try { await rejectKyc(userId, reason); load(); } catch { /* retry available */ } finally { setUpdating(null); }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#2C1810]">KYC Review</h1>
        <p className="text-sm text-[#6B5248] mt-0.5">Manual identity and bank detail verification before escrow payouts.</p>
      </div>

      <div className="flex gap-2 mb-5">
        {(['PENDING', 'VERIFIED', 'REJECTED', 'all'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${tab === t ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8]'}`}>
            {t === 'all' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

      {loading ? (
        <p className="text-[#A08070] text-sm">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
          <p className="text-4xl mb-3">🪪</p>
          <p className="font-semibold text-[#2C1810]">Nothing in this filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.userId} className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-[#2C1810]">{r.user?.name ?? 'Unknown'}</p>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${STATUS_BADGE[r.status]}`}>{r.status}</span>
                  </div>
                  <p className="text-xs text-[#A08070]">{r.user?.email} · {r.user?.role}</p>
                </div>
                <div className="flex gap-2">
                  {r.status !== 'VERIFIED' && (
                    <button onClick={() => handleVerify(r.userId)} disabled={updating === r.userId}
                      className="text-xs font-semibold text-green-700 border border-green-200 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 disabled:opacity-50">
                      Verify
                    </button>
                  )}
                  {r.status !== 'REJECTED' && (
                    <button onClick={() => handleReject(r.userId)} disabled={updating === r.userId}
                      className="text-xs font-semibold text-red-700 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 disabled:opacity-50">
                      Reject
                    </button>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mt-4 text-xs text-[#3D2B22]">
                <p><span className="text-[#A08070]">Aadhaar:</span> {r.aadhaarNumber ?? '—'}</p>
                <p><span className="text-[#A08070]">PAN:</span> {r.panNumber ?? '—'}</p>
                <p><span className="text-[#A08070]">Business:</span> {r.businessName ?? '—'}</p>
                <p><span className="text-[#A08070]">GST:</span> {r.gstNumber ?? '—'}</p>
                <p><span className="text-[#A08070]">Account holder:</span> {r.bankAccountHolderName ?? '—'}</p>
                <p><span className="text-[#A08070]">Account / IFSC:</span> {r.bankAccountNumber ?? '—'} / {r.bankIfsc ?? '—'}</p>
              </div>
              <div className="flex gap-4 mt-3">
                {r.panCardUrl && <a href={r.panCardUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#C0593A] hover:underline">View PAN card →</a>}
                {r.bankProofUrl && <a href={r.bankProofUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#C0593A] hover:underline">View bank proof →</a>}
              </div>
              {r.rejectionReason && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3">Rejected: {r.rejectionReason}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAdminReports, updateReportStatus, type AdminReport } from '@/lib/reports';
import { SkeletonListRows } from '@/components/Skeleton';

type Tab = 'OPEN' | 'RESOLVED' | 'DISMISSED' | 'all';

const STATUS_BADGE: Record<AdminReport['status'], string> = {
  OPEN: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  RESOLVED: 'bg-green-50 text-green-700 border-green-200',
  DISMISSED: 'bg-gray-100 text-gray-500 border-gray-200',
};

const TARGET_LABEL: Record<string, string> = {
  CONTRACTOR: 'Contractor', LABOUR: 'Labour', SERVICE_EXPERT: 'Service Expert',
  MATERIAL_SUPPLIER: 'Material Supplier', BUILDER: 'Builder', PROPERTY_AGENT: 'Property Agent',
  MATERIAL: 'Material', LAND: 'Land', PROPERTY: 'Property',
};

export default function AdminReportsPage() {
  const [tab, setTab] = useState<Tab>('OPEN');
  const [rows, setRows] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchAdminReports(tab === 'all' ? undefined : tab)
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  async function handleUpdate(id: string, status: 'RESOLVED' | 'DISMISSED') {
    setUpdating(id);
    try {
      await updateReportStatus(id, status);
      load();
    } catch { /* retry available */ } finally { setUpdating(null); }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#2C1810]">User Reports</h1>
        <p className="text-sm text-[#6B5248] mt-0.5">Profiles and listings flagged by users via the Report button.</p>
      </div>

      <div className="flex gap-2 mb-5">
        {(['OPEN', 'RESOLVED', 'DISMISSED', 'all'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${tab === t ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8]'}`}>
            {t === 'all' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

      {loading ? (
        <SkeletonListRows count={6} />
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
          <p className="text-4xl mb-3">🏳️</p>
          <p className="font-semibold text-[#2C1810]">Nothing in this filter</p>
        </div>
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {rows.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-[#2C1810] text-sm">{TARGET_LABEL[r.targetType] ?? r.targetType}</p>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${STATUS_BADGE[r.status]}`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-sm text-[#6B5248] mt-1.5">{r.reason}</p>
                <p className="text-xs text-[#A08070] mt-2">
                  Reported by {r.reporter?.name ?? 'Unknown'} ({r.reporter?.email}) · {new Date(r.createdAt).toLocaleDateString('en-IN')}
                </p>
                {r.status === 'OPEN' && (
                  <div className="flex gap-4 mt-3 pt-3 border-t border-[#F0E8E2]">
                    <button onClick={() => handleUpdate(r.id, 'RESOLVED')} disabled={updating === r.id}
                      className="text-xs font-semibold text-green-700 hover:underline disabled:opacity-50">
                      Mark Resolved
                    </button>
                    <button onClick={() => handleUpdate(r.id, 'DISMISSED')} disabled={updating === r.id}
                      className="text-xs font-semibold text-gray-500 hover:underline disabled:opacity-50">
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="hidden md:block bg-white rounded-2xl border border-[#EBE0D8] shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EBE0D8] text-left text-xs text-[#A08070] uppercase tracking-wide">
                  <th className="px-5 py-3 font-semibold">Target</th>
                  <th className="px-5 py-3 font-semibold">Reason</th>
                  <th className="px-5 py-3 font-semibold">Reporter</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Reported</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-[#F0E8E2] last:border-none align-top">
                    <td className="px-5 py-3 font-semibold text-[#2C1810]">{TARGET_LABEL[r.targetType] ?? r.targetType}</td>
                    <td className="px-5 py-3 text-[#6B5248] max-w-xs">{r.reason}</td>
                    <td className="px-5 py-3 text-[#6B5248]">
                      <p>{r.reporter?.name ?? 'Unknown'}</p>
                      <p className="text-xs text-[#A08070]">{r.reporter?.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${STATUS_BADGE[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#6B5248]">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-3">
                      {r.status === 'OPEN' ? (
                        <div className="flex gap-3">
                          <button onClick={() => handleUpdate(r.id, 'RESOLVED')} disabled={updating === r.id}
                            className="text-xs font-semibold text-green-700 hover:underline disabled:opacity-50">
                            Resolve
                          </button>
                          <button onClick={() => handleUpdate(r.id, 'DISMISSED')} disabled={updating === r.id}
                            className="text-xs font-semibold text-gray-500 hover:underline disabled:opacity-50">
                            Dismiss
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-[#A08070]">—</span>
                      )}
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

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { fetchAdminProjects, moderateProject, type AdminProject } from '@/lib/admin';

type Tab = 'all' | 'OPEN' | 'AWARDED' | 'CLOSED';

const STATUS_BADGE: Record<AdminProject['status'], string> = {
  OPEN: 'bg-green-100 text-green-800 border-green-200',
  AWARDED: 'bg-blue-100 text-blue-800 border-blue-200',
  CLOSED: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [tab, setTab] = useState<Tab>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchAdminProjects(tab === 'all' ? undefined : tab)
      .then(setProjects)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  async function handleModerate(id: string, status: 'OPEN' | 'CLOSED') {
    setUpdating(id);
    try {
      await moderateProject(id, status);
      load();
    } catch {
      /* leave state as-is; admin can retry */
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#2C1810]">Posted Projects</h1>
          <p className="text-sm text-[#6B5248] mt-0.5">Moderate homeowner-posted projects on the open marketplace.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {(['all', 'OPEN', 'AWARDED', 'CLOSED'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${tab === t ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8]'}`}
          >
            {t === 'all' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
      )}

      {loading ? (
        <p className="text-[#A08070] text-sm">Loading…</p>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
          <p className="text-4xl mb-3">🏗️</p>
          <p className="font-semibold text-[#2C1810]">No projects in this filter</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#EBE0D8] text-left text-xs text-[#A08070] uppercase tracking-wide">
                <th className="px-5 py-3 font-semibold">Project</th>
                <th className="px-5 py-3 font-semibold">Owner</th>
                <th className="px-5 py-3 font-semibold">Budget</th>
                <th className="px-5 py-3 font-semibold">Bids</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-b border-[#F0E8E2] last:border-none">
                  <td className="px-5 py-3">
                    <Link href={`/projects/${p.id}`} className="font-semibold text-[#2C1810] hover:text-[#C0593A]">
                      {p.title}
                    </Link>
                    <p className="text-xs text-[#A08070] mt-0.5">{p.city}{p.state ? `, ${p.state}` : ''} · {p.projectType}</p>
                  </td>
                  <td className="px-5 py-3 text-[#6B5248]">
                    {p.owner?.name ?? '—'}
                    {p.owner?.email && <p className="text-xs text-[#A08070]">{p.owner.email}</p>}
                  </td>
                  <td className="px-5 py-3 text-[#6B5248]">
                    ₹{Number(p.budgetMin).toLocaleString('en-IN')}–{Number(p.budgetMax).toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-3 text-[#6B5248]">{p._count?.bids ?? 0}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${STATUS_BADGE[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {p.status === 'CLOSED' ? (
                      <button
                        onClick={() => handleModerate(p.id, 'OPEN')}
                        disabled={updating === p.id}
                        className="text-xs font-semibold text-[#C0593A] hover:underline disabled:opacity-50"
                      >
                        Reopen
                      </button>
                    ) : (
                      <button
                        onClick={() => handleModerate(p.id, 'CLOSED')}
                        disabled={updating === p.id}
                        className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                      >
                        Take down
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { fetchEarlyAccessSignups, type AdminEarlyAccessSignup } from '@/lib/admin';

export default function AdminEarlyAccessPage() {
  const [rows, setRows] = useState<AdminEarlyAccessSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEarlyAccessSignups()
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#2C1810]">Early Access Signups</h1>
        <p className="text-sm text-[#6B5248] mt-0.5">Email waitlist for the mobile app — {rows.length} total.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
      )}

      {loading ? (
        <p className="text-[#A08070] text-sm">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
          <p className="text-4xl mb-3">🚀</p>
          <p className="font-semibold text-[#2C1810]">No signups yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#EBE0D8] text-left text-xs text-[#A08070] uppercase tracking-wide">
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Interest</th>
                <th className="px-5 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[#F0E8E2] last:border-none">
                  <td className="px-5 py-3 font-semibold text-[#2C1810]">{r.email}</td>
                  <td className="px-5 py-3 text-[#6B5248]">{r.interest ?? '—'}</td>
                  <td className="px-5 py-3 text-xs text-[#6B5248]">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

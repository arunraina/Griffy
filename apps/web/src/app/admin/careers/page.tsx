'use client';

import { useEffect, useState } from 'react';
import { fetchCareerApplications, type AdminCareerApplication } from '@/lib/admin';

export default function AdminCareersPage() {
  const [rows, setRows] = useState<AdminCareerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCareerApplications()
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#2C1810]">Career Applications</h1>
        <p className="text-sm text-[#6B5248] mt-0.5">Internship applications submitted via the Careers page.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
      )}

      {loading ? (
        <p className="text-[#A08070] text-sm">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
          <p className="text-4xl mb-3">💼</p>
          <p className="font-semibold text-[#2C1810]">No applications yet</p>
        </div>
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {rows.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-4">
                <p className="font-semibold text-[#2C1810]">{r.name}</p>
                <p className="text-xs text-[#A08070]">{r.email}</p>
                <p className="text-sm text-[#6B5248] mt-1.5">{r.role}</p>
                <p className="text-sm text-[#6B5248] mt-1">{r.institute}</p>
                <p className="text-xs text-[#A08070]">{r.courseOrDegree} · {r.degreeStatus === 'PURSUING' ? 'Pursuing' : 'Done'} · {r.graduationYear}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F0E8E2]">
                  <span className="text-xs text-[#A08070]">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                  <a href={r.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#C0593A] hover:underline">
                    View Resume →
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block bg-white rounded-2xl border border-[#EBE0D8] shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EBE0D8] text-left text-xs text-[#A08070] uppercase tracking-wide">
                  <th className="px-5 py-3 font-semibold">Applicant</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Education</th>
                  <th className="px-5 py-3 font-semibold">Resume</th>
                  <th className="px-5 py-3 font-semibold">Applied</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-[#F0E8E2] last:border-none">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-[#2C1810]">{r.name}</p>
                      <p className="text-xs text-[#A08070]">{r.email}</p>
                    </td>
                    <td className="px-5 py-3 text-[#6B5248]">{r.role}</td>
                    <td className="px-5 py-3 text-[#6B5248]">
                      <p>{r.institute}</p>
                      <p className="text-xs text-[#A08070]">{r.courseOrDegree} · {r.degreeStatus === 'PURSUING' ? 'Pursuing' : 'Done'} · {r.graduationYear}</p>
                    </td>
                    <td className="px-5 py-3">
                      <a href={r.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#C0593A] hover:underline">
                        View →
                      </a>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#6B5248]">
                      {new Date(r.createdAt).toLocaleDateString('en-IN')}
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

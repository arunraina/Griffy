'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { listProjects, type Project } from '@/lib/projects';

const TYPE_LABEL: Record<string, string> = {
  civil: 'Civil / Structure', electrical: 'Electrical', plumbing: 'Plumbing', interior: 'Interior',
  structural: 'Structural', painting: 'Painting', architecture: 'Architecture', other: 'Other',
};
const TYPE_EMOJI: Record<string, string> = {
  civil: '🏗️', electrical: '⚡', plumbing: '🔧', interior: '🛋️',
  structural: '🏛️', painting: '🎨', architecture: '📐', other: '🔨',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    listProjects(typeFilter || undefined).then((p) => { setProjects(p); setLoading(false); });
  }, [typeFilter]);

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#2C1810] mb-1" style={{ fontFamily: 'Georgia, serif' }}>Open Projects</h1>
            <p className="text-[#6B5248] text-sm">Homeowners looking for contractors — bid on projects that fit your trade.</p>
          </div>
          <Link href="/post-project" className="bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap">
            + Post a Project
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setTypeFilter('')}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${!typeFilter ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8] hover:border-[#D8B8A8]'}`}
          >
            All Types
          </button>
          {Object.entries(TYPE_LABEL).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTypeFilter(id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${typeFilter === id ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8] hover:border-[#D8B8A8]'}`}
            >
              {TYPE_EMOJI[id]} {label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-[#A08070] text-sm">Loading projects…</p>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
            <p className="text-4xl mb-3">🏗️</p>
            <p className="font-semibold text-[#2C1810] mb-1">No open projects right now</p>
            <p className="text-sm text-[#6B5248]">Check back soon, or post your own project to get bids.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5 hover:border-[#D8B8A8] hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{TYPE_EMOJI[p.projectType] ?? '🔨'}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F5EDE8] text-[#7A3E27]">
                    {TYPE_LABEL[p.projectType] ?? p.projectType}
                  </span>
                </div>
                <p className="text-sm font-bold text-[#2C1810] mb-1">{p.title}</p>
                <p className="text-xs text-[#6B5248] line-clamp-2 mb-3">{p.description}</p>
                <div className="flex items-center gap-3 text-xs text-[#A08070] flex-wrap">
                  {p.city && <span>📍 {p.city}{p.state ? `, ${p.state}` : ''}</span>}
                  {p.timeline && <span>📅 {p.timeline}</span>}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F0E8E2]">
                  <span className="text-sm font-bold text-[#C0593A]">
                    ₹{Number(p.budgetMin).toLocaleString('en-IN')} – ₹{Number(p.budgetMax).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-[#A08070]">{p._count?.bids ?? 0} bid{(p._count?.bids ?? 0) !== 1 ? 's' : ''}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

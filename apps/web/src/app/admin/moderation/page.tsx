'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  fetchAdminContent, moderateContent,
  CONTENT_TYPE_LABELS, type ContentType,
} from '@/lib/admin';
import { SkeletonListRows } from '@/components/Skeleton';

const CONTENT_TYPES = Object.keys(CONTENT_TYPE_LABELS) as ContentType[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

function titleOf(type: ContentType, r: Row): string {
  switch (type) {
    case 'review': return `${r.rating}★ — ${r.comment ?? '(no comment)'}`;
    case 'project': return r.title;
    case 'land': return r.title;
    case 'property': return r.title;
    case 'material': return r.name;
  }
}

function subtitleOf(type: ContentType, r: Row): string {
  switch (type) {
    case 'review': return `by ${r.reviewer?.name ?? 'Unknown'} · ${r.targetType}`;
    case 'project': return `${r.owner?.name ?? 'Unknown'} · ${r._count?.bids ?? 0} bids · ${r.status}`;
    case 'land': return r.owner?.user?.name ? `Owner: ${r.owner.user.name}` : '';
    case 'property': return r.seller?.user?.name ? `Seller: ${r.seller.user.name}` : '';
    case 'material': return r.supplier?.businessName ?? r.supplier?.user?.name ?? '';
  }
}

export default function AdminModerationPage() {
  const [type, setType] = useState<ContentType>('review');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'hidden' | 'demoted' | 'active'>('all');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchAdminContent(type)
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [type]);

  useEffect(() => { load(); }, [load]);

  async function toggle(id: string, field: 'isHidden' | 'isDemoted', value: boolean) {
    setUpdating(id);
    try {
      await moderateContent(type, id, { [field]: value });
      load();
    } catch {
      /* leave state; admin can retry */
    } finally {
      setUpdating(null);
    }
  }

  const filtered = rows.filter((r) => {
    if (filter === 'hidden') return r.isHidden;
    if (filter === 'demoted') return r.isDemoted && !r.isHidden;
    if (filter === 'active') return !r.isHidden && !r.isDemoted;
    return true;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#2C1810]">Content Moderation</h1>
        <p className="text-sm text-[#6B5248] mt-0.5">
          Hide spam or policy-violating content entirely, or demote low-quality content so it ranks lower without removing it.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {CONTENT_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${type === t ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8]'}`}
          >
            {CONTENT_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-5">
        {(['all', 'active', 'demoted', 'hidden'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${filter === f ? 'bg-[#2C1810] text-white border-[#2C1810]' : 'bg-white text-[#6B5248] border-[#EBE0D8]'}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
      )}

      {loading ? (
        <SkeletonListRows count={6} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
          <p className="text-4xl mb-3">✨</p>
          <p className="font-semibold text-[#2C1810]">Nothing in this filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-4 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-semibold text-sm text-[#2C1810]">{titleOf(type, r)}</p>
                  {r.isHidden && <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">HIDDEN</span>}
                  {r.isDemoted && !r.isHidden && <span className="text-[10px] font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">DEMOTED</span>}
                </div>
                <p className="text-xs text-[#A08070]">{subtitleOf(type, r)}</p>
                {r.moderationNote && <p className="text-xs text-[#6B5248] mt-1 italic">Note: {r.moderationNote}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => toggle(r.id, 'isDemoted', !r.isDemoted)}
                  disabled={updating === r.id}
                  className="text-xs font-semibold text-[#9E3F24] border border-[#E8C4B0] bg-[#FAEEE9] px-3 py-1.5 rounded-lg hover:bg-[#F0D8CC] disabled:opacity-50"
                >
                  {r.isDemoted ? 'Undo demote' : 'Demote'}
                </button>
                <button
                  onClick={() => toggle(r.id, 'isHidden', !r.isHidden)}
                  disabled={updating === r.id}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50 ${
                    r.isHidden ? 'text-green-700 border border-green-200 bg-green-50 hover:bg-green-100' : 'text-red-700 border border-red-200 bg-red-50 hover:bg-red-100'
                  }`}
                >
                  {r.isHidden ? 'Unhide' : 'Hide'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

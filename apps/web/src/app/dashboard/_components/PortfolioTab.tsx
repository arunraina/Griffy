'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  fetchPortfolio, createPortfolioItem, updatePortfolioItem, deletePortfolioItem,
  type PortfolioItem, type PortfolioProfileType,
} from '@/lib/portfolio';
import { uploadImage } from '@/lib/storage';
import { SkeletonCardGrid } from '@/components/Skeleton';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function authHeaders(): Promise<Record<string, string>> {
  const { getImpersonationToken } = await import('@/lib/impersonation');
  const impersonationToken = getImpersonationToken();
  if (impersonationToken) return { Authorization: `Bearer ${impersonationToken}` };
  const { createClient } = await import('@/lib/supabase');
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${session.access_token}` };
}

async function fetchMyProfileId(profileType: PortfolioProfileType): Promise<string | null> {
  const path = profileType === 'contractor' ? 'contractor-profiles' : profileType === 'labour' ? 'labour-profiles' : 'service-expert-profiles';
  const headers = await authHeaders();
  const res = await fetch(`${API}/${path}/me`, { headers });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.id ?? null;
}

const ROLE_TO_PROFILE_TYPE: Record<string, PortfolioProfileType> = {
  CONTRACTOR: 'contractor',
  LABOUR: 'labour',
  SERVICE_EXPERT: 'service-expert',
};

export default function PortfolioTab({ role }: { role: string }) {
  const profileType = ROLE_TO_PROFILE_TYPE[role];
  const [profileId, setProfileId] = useState<string | null>(null);
  const [items, setItems] = useState<PortfolioItem[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PortfolioItem | null>(null);

  function load() {
    if (!profileType) return;
    fetchMyProfileId(profileType).then((id) => {
      setProfileId(id);
      if (id) fetchPortfolio(profileType, id).then(setItems);
      else setItems([]);
    });
  }

  useEffect(load, [profileType]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!profileType) return null;

  if (items === null) return <SkeletonCardGrid variant="media" count={3} />;

  if (!profileId) {
    return (
      <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
        <p className="text-4xl mb-3">🛠️</p>
        <p className="font-semibold text-[#2C1810] mb-1">Complete your profile first</p>
        <p className="text-sm text-[#6B5248]">You need a {profileType} profile before you can add past work.</p>
      </div>
    );
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this portfolio item?')) return;
    await deletePortfolioItem(id);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6B5248]">Showcase past work — {items.length}/20 items</p>
        {items.length < 20 && (
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white px-4 py-2 rounded-lg transition-colors"
          >
            + Add Item
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
          <p className="text-4xl mb-3">🖼️</p>
          <p className="font-semibold text-[#2C1810] mb-1">No portfolio items yet</p>
          <p className="text-sm text-[#6B5248]">Showing past work helps homeowners trust you faster.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 gap-0.5">
                {item.imageUrls.slice(0, 3).map((url, i) => (
                  <div key={i} className="relative w-full aspect-square">
                    <Image src={url} alt="" fill sizes="150px" className="object-cover" />
                  </div>
                ))}
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-[#2C1810] truncate">{item.title}</p>
                {item.description && <p className="text-xs text-[#6B5248] mt-0.5 line-clamp-2">{item.description}</p>}
                <div className="flex gap-3 mt-2">
                  <button onClick={() => { setEditing(item); setShowForm(true); }} className="text-xs font-semibold text-[#C0593A] hover:underline">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <PortfolioItemForm
          profileType={profileType}
          item={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}

function PortfolioItemForm({
  profileType, item, onClose, onSaved,
}: {
  profileType: PortfolioProfileType;
  item: PortfolioItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(item?.title ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [completedAt, setCompletedAt] = useState(item?.completedAt?.slice(0, 10) ?? '');
  const [imageUrls, setImageUrls] = useState<string[]>(item?.imageUrls ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    if (imageUrls.length + files.length > 12) {
      setError('Maximum 12 photos per item.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const uploaded = await Promise.all(files.map((f) => uploadImage('portfolio', f)));
      setImageUrls((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function removeImage(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit() {
    if (!title.trim()) { setError('Title is required.'); return; }
    if (imageUrls.length === 0) { setError('Add at least one photo.'); return; }

    setSaving(true);
    setError('');
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        imageUrls,
        completedAt: completedAt || undefined,
      };
      if (item) await updatePortfolioItem(item.id, payload);
      else await createPortfolioItem({ profileType, ...payload });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-[#2C1810] mb-4">{item ? 'Edit' : 'Add'} Portfolio Item</h2>

        <label className="block text-xs font-semibold text-[#6B5248] mb-1">Title</label>
        <input
          value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. 3BHK Villa Renovation"
          className="w-full border border-[#EBE0D8] rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:border-[#C0593A]"
        />

        <label className="block text-xs font-semibold text-[#6B5248] mb-1">Description (optional)</label>
        <textarea
          value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
          placeholder="What was the project?"
          className="w-full border border-[#EBE0D8] rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:border-[#C0593A]"
        />

        <label className="block text-xs font-semibold text-[#6B5248] mb-1">Completed on (optional)</label>
        <input
          type="date" value={completedAt} onChange={(e) => setCompletedAt(e.target.value)}
          className="w-full border border-[#EBE0D8] rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:border-[#C0593A]"
        />

        <label className="block text-xs font-semibold text-[#6B5248] mb-1">Photos</label>
        <div className="grid grid-cols-4 gap-2 mb-2">
          {imageUrls.map((url) => (
            <div key={url} className="relative aspect-square">
              <Image src={url} alt="" fill sizes="100px" className="object-cover rounded-lg" />
              <button
                onClick={() => removeImage(url)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))}
          {imageUrls.length < 12 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="aspect-square border-2 border-dashed border-[#EBE0D8] rounded-lg flex items-center justify-center text-[#A08070] hover:border-[#C0593A] hover:text-[#C0593A] transition-colors disabled:opacity-50"
            >
              {uploading ? '…' : '+'}
            </button>
          )}
        </div>
        <input
          ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple
          className="hidden" onChange={handleFilesSelected}
        />

        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

        <div className="flex gap-2 justify-end mt-4">
          <button onClick={onClose} disabled={saving}
            className="text-sm font-semibold text-[#6B5248] px-4 py-2 rounded-lg hover:bg-[#FAEEE9] disabled:opacity-40">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving || uploading}
            className="text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white px-4 py-2 rounded-lg disabled:opacity-40">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

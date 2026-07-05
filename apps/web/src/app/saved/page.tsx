'use client';

import Link from 'next/link';
import { useSaved, type SavedType } from '@/context/SavedContext';
import { useAuthUser } from '@/lib/useAuthUser';

const TYPE_LABEL: Record<SavedType, string> = {
  material: 'Materials',
  contractor: 'Contractors',
  labour: 'Labour',
  service_expert: 'Service Experts',
};

export default function SavedPage() {
  const { items, remove } = useSaved();
  const { user, loading } = useAuthUser();

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-[#FAEEE9] rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">
            ♡
          </div>
          <h1 className="text-xl font-bold text-[#2C1810] mb-2">Log in to see your saved items</h1>
          <p className="text-[#6B5248] mb-6">
            Saved materials, contractors, labour, and service experts live on your account.
          </p>
          <Link
            href="/login"
            className="inline-block bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Log in
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-[#FAEEE9] rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">
            ♡
          </div>
          <h1 className="text-xl font-bold text-[#2C1810] mb-2">Nothing saved yet</h1>
          <p className="text-[#6B5248] mb-6">
            Tap the heart icon on any material, contractor, labour, or service expert to save it here.
          </p>
          <Link
            href="/search"
            className="inline-block bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Start Browsing
          </Link>
        </div>
      </div>
    );
  }

  const groups = (Object.keys(TYPE_LABEL) as SavedType[])
    .map((type) => ({ type, label: TYPE_LABEL[type], items: items.filter((i) => i.type === type) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-[#2C1810] mb-6" style={{ fontFamily: 'Georgia, serif' }}>
          Saved
        </h1>

        <div className="space-y-8">
          {groups.map((g) => (
            <div key={g.type}>
              <p className="text-sm font-bold text-[#2C1810] mb-3">{g.label}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {g.items.map((item) => (
                  <div
                    key={`${item.type}:${item.id}`}
                    className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-[#EBE0D8] hover:border-[#D8B8A8] transition-colors"
                  >
                    <Link href={item.href} className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-2xl shrink-0">{item.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#2C1810] truncate">{item.title}</p>
                        <p className="text-xs text-[#A08070] truncate">{item.subtitle}</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => remove(item.type, item.id)}
                      className="text-gray-400 hover:text-red-500 text-sm shrink-0 px-2"
                      aria-label="Remove from saved"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

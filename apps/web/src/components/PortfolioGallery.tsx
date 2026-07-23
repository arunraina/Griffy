'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchPortfolio, type PortfolioItem, type PortfolioProfileType } from '@/lib/portfolio';

export default function PortfolioGallery({ profileType, profileId }: { profileType: PortfolioProfileType; profileId: string }) {
  const [items, setItems] = useState<PortfolioItem[] | null>(null);
  const [active, setActive] = useState<{ item: PortfolioItem; imageIndex: number } | null>(null);

  useEffect(() => {
    fetchPortfolio(profileType, profileId).then(setItems).catch(() => setItems([]));
  }, [profileType, profileId]);

  if (items === null) return null;

  if (items.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-3xl mb-2">🖼️</p>
        <p className="text-sm text-[#A08070]">No portfolio items yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive({ item, imageIndex: 0 })}
            className="relative rounded-xl overflow-hidden aspect-video group"
          >
            <Image src={item.imageUrls[0]} alt={item.title} fill sizes="(max-width: 640px) 33vw, 200px" className="object-cover group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-2">
              <p className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity truncate">{item.title}</p>
            </div>
            {item.imageUrls.length > 1 && (
              <span className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                +{item.imageUrls.length - 1}
              </span>
            )}
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4"
          onClick={() => setActive(null)}
        >
          <div className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-black rounded-xl overflow-hidden">
              {/* Left as a plain <img>: this box sizes itself to the photo's
                  own natural aspect ratio (arbitrary per portfolio item), which
                  next/image's fill/width+height modes can't express without
                  either guessing dimensions or forcing every photo into one
                  fixed ratio -- not a safe swap here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active.item.imageUrls[active.imageIndex]}
                alt={active.item.title}
                className="w-full max-h-[70vh] object-contain"
              />
              {active.item.imageUrls.length > 1 && (
                <>
                  <button
                    onClick={() => setActive({ ...active, imageIndex: (active.imageIndex - 1 + active.item.imageUrls.length) % active.item.imageUrls.length })}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full text-white flex items-center justify-center"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setActive({ ...active, imageIndex: (active.imageIndex + 1) % active.item.imageUrls.length })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full text-white flex items-center justify-center"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
            <div className="bg-white rounded-b-xl p-4">
              <p className="text-sm font-bold text-[#2C1810]">{active.item.title}</p>
              {active.item.description && <p className="text-xs text-[#6B5248] mt-1">{active.item.description}</p>}
              {active.item.completedAt && (
                <p className="text-[11px] text-[#A08070] mt-1">
                  Completed {new Date(active.item.completedAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
            <button
              onClick={() => setActive(null)}
              className="mt-3 text-white text-sm font-semibold mx-auto block hover:underline"
            >
              Close ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

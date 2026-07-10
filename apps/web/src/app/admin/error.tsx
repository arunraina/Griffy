'use client';

import { useEffect } from 'react';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
      <p className="text-4xl mb-3">⚠️</p>
      <p className="font-semibold text-[#2C1810]">This section failed to load</p>
      <p className="text-sm text-[#A08070] mt-1">{error.message || 'An unexpected error occurred.'}</p>
      <button
        onClick={reset}
        className="mt-4 text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white px-4 py-2 rounded-xl transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

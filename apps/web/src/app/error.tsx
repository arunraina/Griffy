'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-md">
        <p className="text-6xl mb-4">⚠️</p>
        <h1 className="text-2xl font-bold text-[#2C1810]" style={{ fontFamily: 'Georgia, serif' }}>
          Something went wrong
        </h1>
        <p className="text-sm text-[#6B5248] mt-2">
          An unexpected error occurred. You can try again, or head back to the homepage.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={reset}
            className="bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="border border-[#EBE0D8] text-[#2C1810] hover:bg-[#FAEEE9] font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
}

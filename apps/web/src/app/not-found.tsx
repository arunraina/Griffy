import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-md">
        <p className="text-6xl mb-4">🧭</p>
        <h1 className="text-2xl font-bold text-[#2C1810]" style={{ fontFamily: 'Georgia, serif' }}>
          Page not found
        </h1>
        <p className="text-sm text-[#6B5248] mt-2">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <Link
            href="/"
            className="bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Back to home
          </Link>
          <Link
            href="/search"
            className="border border-[#EBE0D8] text-[#2C1810] hover:bg-[#FAEEE9] font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Search Griffy
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { Skeleton } from '@/components/Skeleton';

export default function HomeHero() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // `user` comes from AuthProvider's fast session check (no backend round
  // trip) — as soon as we know someone's logged in we send them straight
  // into the app instead of trying to retrofit this marketing page into a
  // personalized one. That retrofit was the actual bug: it depended on the
  // slow GET /users/me to decide what to show, so logged-in visitors kept
  // seeing "Get Started Free" for however long that call took. A redirect
  // decided by the fast check has no such window.
  useEffect(() => {
    if (!loading && user) {
      router.replace('/home');
    }
  }, [loading, user, router]);

  if (loading || user) {
    return (
      <>
        <Skeleton className="h-7 w-56 rounded-full mb-6 mx-auto" />
        <Skeleton className="h-11 w-full max-w-lg rounded-lg mb-2 mx-auto" />
        <Skeleton className="h-11 w-2/3 rounded-lg mb-5 mx-auto" />
        <Skeleton className="h-4 w-full max-w-xl rounded-md mb-2 mx-auto" />
        <Skeleton className="h-4 w-2/3 max-w-md rounded-md mb-8 mx-auto" />
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <Skeleton className="h-14 w-48 rounded-xl" />
          <Skeleton className="h-14 w-56 rounded-xl" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="inline-flex items-center gap-2 bg-[#FAEEE9] text-[#9E3F24] text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
        🏠 For homeowners across India
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-[#2C1810] leading-tight mb-5"
        style={{ fontFamily: 'Georgia, serif' }}>
        Build your dream home with{' '}
        <em className="not-italic text-[#C0593A]">trusted professionals</em>
      </h1>
      <p className="text-[#6B5248] text-base leading-relaxed mb-8 max-w-xl mx-auto">
        India's one-stop platform for construction — find contractors, hire labour, book service experts, source materials and discover land
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        <Link href="/signup"
          className="inline-block bg-[#C0593A] hover:bg-[#9E3F24] text-white font-bold text-base px-10 py-4 rounded-xl transition-colors shadow-sm">
          Get Started Free
        </Link>
      </div>
    </>
  );
}

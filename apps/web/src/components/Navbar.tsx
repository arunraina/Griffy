'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

interface UserInfo { name: string }

const NAV_LINKS = [
  { href: '/contractors',             label: 'Find Contractors' },
  { href: '/materials',               label: 'Materials' },
  { href: '/land',                    label: 'Land' },
  { href: '/providers',               label: 'Services' },
  { href: '/contractors?type=labour', label: 'Hire Labour' },
];

export default function Navbar() {
  const router   = useRouter();
  const supabase = createClient();

  const [user, setUser]         = useState<UserInfo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) setUser({ name: u.user_metadata?.name ?? u.email?.split('@')[0] ?? 'User' });
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        const u = session.user;
        setUser({ name: u.user_metadata?.name ?? u.email?.split('@')[0] ?? 'User' });
      } else {
        setUser(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleLogout() {
    setMenuOpen(false);
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <nav className="bg-white border-b border-[#f0ebe6] sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-[#C0593A] font-bold text-2xl tracking-tight flex-shrink-0">
          Griffy
        </Link>

        {/* Center nav — desktop */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className="text-gray-600 text-sm font-medium hover:text-[#C0593A] transition-colors whitespace-nowrap">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right — desktop */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-500 max-w-[120px] truncate">{user.name}</span>
              <Link href="/dashboard"
                className="text-sm font-semibold text-[#C0593A] hover:underline">
                Dashboard
              </Link>
              <button onClick={handleLogout}
                className="text-sm border border-[#C0593A] text-[#C0593A] px-4 py-1.5 rounded-lg hover:bg-[#FAEEE9] transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login"
                className="text-sm font-medium border border-[#C0593A] text-[#C0593A] px-4 py-2 rounded-lg hover:bg-[#FAEEE9] transition-colors">
                Log in
              </Link>
              <Link href="/signup"
                className="text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white px-4 py-2 rounded-lg transition-colors">
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Hamburger — mobile */}
        <button onClick={() => setMenuOpen(m => !m)} aria-label="Toggle menu"
          className="md:hidden text-gray-600 text-xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors">
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-lg border-t border-[#f0ebe6] z-50">
          <div className="flex flex-col px-5 py-5 gap-4">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="text-gray-600 text-sm font-medium hover:text-[#C0593A] transition-colors py-1">
                {l.label}
              </Link>
            ))}
            <div className="border-t border-[#f0ebe6] pt-4 flex flex-col gap-3">
              {user ? (
                <>
                  <p className="text-xs text-gray-400">{user.name}</p>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                    className="text-sm font-semibold text-[#C0593A] py-1">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout}
                    className="text-sm border border-[#C0593A] text-[#C0593A] px-4 py-2.5 rounded-lg text-left">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)}
                    className="text-sm font-medium border border-[#C0593A] text-[#C0593A] px-4 py-2.5 rounded-lg text-center">
                    Log in
                  </Link>
                  <Link href="/signup" onClick={() => setMenuOpen(false)}
                    className="text-sm font-semibold bg-[#C0593A] text-white px-4 py-2.5 rounded-lg text-center">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

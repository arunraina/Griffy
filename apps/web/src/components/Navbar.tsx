'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { isEnabled } from '@/lib/featureFlags';
import { useCart } from '@/context/CartContext';
import { useNotifications } from '@/context/NotificationContext';
import { useChat } from '@/context/ChatContext';
import NotificationBell from './NotificationBell';
import SearchBar from './SearchBar';

interface UserInfo { name: string }

function getMarketplaceLinks() {
  return [
    isEnabled('contractors')     && { href: '/contractors',     label: 'Find Contractors', icon: '🏗️' },
    isEnabled('labour')          && { href: '/labour',          label: 'Labour', icon: '👷' },
    isEnabled('service_experts') && { href: '/service-experts', label: 'Service Experts', icon: '⚡' },
    isEnabled('materials')       && { href: '/materials',       label: 'Materials', icon: '🧱' },
    isEnabled('properties')
      ? { href: '/properties', label: 'Properties', icon: '🏠' }
      : isEnabled('land')
      ? { href: '/land',       label: 'Land', icon: '🌍' }
      : null,
  ].filter(Boolean) as { href: string; label: string; icon: string }[];
}

function getDirectLinks(loggedIn: boolean) {
  return [
    loggedIn && { href: '/projects', label: 'Projects' },
    { href: '/estimate', label: 'Estimate' },
  ].filter(Boolean) as { href: string; label: string }[];
}

export default function Navbar() {
  const router   = useRouter();
  const supabase = createClient();
  const MARKETPLACE_LINKS = getMarketplaceLinks();
  const { count: cartCount } = useCart();
  const { unreadCount } = useNotifications();
  const { unreadCount: chatUnreadCount } = useChat();

  const [user,          setUser]          = useState<UserInfo | null>(null);
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [signupOpen,    setSignupOpen]    = useState(false);
  const [marketOpen,    setMarketOpen]    = useState(false);

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

  const DIRECT_LINKS = getDirectLinks(!!user);

  async function handleLogout() {
    setMenuOpen(false);
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <nav className="bg-white border-b border-[#f0ebe6] sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-[#C0593A] font-bold text-2xl tracking-tight flex-shrink-0 mr-8">
          Griffy
        </Link>

        {/* Center nav — desktop */}
        <div className="hidden md:flex items-center gap-7 flex-1">
          <div className="relative"
            onMouseEnter={() => setMarketOpen(true)}
            onMouseLeave={() => setMarketOpen(false)}>
            <button className="flex items-center gap-1 text-gray-600 text-sm font-medium hover:text-[#C0593A] transition-colors whitespace-nowrap">
              Marketplace
              <svg className={`w-3 h-3 transition-transform ${marketOpen ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {marketOpen && (
              <div className="absolute left-0 top-full pt-2 w-56 z-50">
                <div className="bg-white border border-[#EBE0D8] rounded-xl shadow-lg overflow-hidden py-1.5">
                  {MARKETPLACE_LINKS.map(l => (
                    <Link key={l.href} href={l.href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2C1810] hover:bg-[#FAEEE9] hover:text-[#C0593A] transition-colors">
                      <span className="text-base">{l.icon}</span>
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          {DIRECT_LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className="text-gray-600 text-sm font-medium hover:text-[#C0593A] transition-colors whitespace-nowrap">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right — desktop */}
        <div className="hidden md:flex items-center gap-3 ml-8">
          <SearchBar />
          {user && (
            <>
              <Link href="/saved" className="text-gray-600 hover:text-[#C0593A] transition-colors w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#FAEEE9]" aria-label="Saved">
                <span className="text-lg">♡</span>
              </Link>
              <Link href="/messages" className="relative text-gray-600 hover:text-[#C0593A] transition-colors w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#FAEEE9]" aria-label="Messages">
                <span className="text-lg">💬</span>
                {chatUnreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C0593A] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
                  </span>
                )}
              </Link>
              <NotificationBell />
              <Link href="/cart" className="relative text-gray-600 hover:text-[#C0593A] transition-colors w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#FAEEE9]" aria-label="Cart">
                <span className="text-lg">🛒</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C0593A] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            </>
          )}
          {user ? (
            <>
              <Link href="/profile" className="text-sm text-gray-500 max-w-[120px] truncate hover:text-[#C0593A]" title="View profile">
                {user.name}
              </Link>
              <Link href="/orders"
                className="text-sm font-semibold text-[#C0593A] hover:underline">
                Orders
              </Link>
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
              <div className="relative"
                onMouseEnter={() => setSignupOpen(true)}
                onMouseLeave={() => setSignupOpen(false)}>
                <Link href="/signup"
                  className="flex items-center gap-1 text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white px-4 py-2 rounded-lg transition-colors">
                  Sign up
                  <svg className={`w-3 h-3 transition-transform ${signupOpen ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                {signupOpen && (
                  <div className="absolute right-0 top-full pt-1.5 w-52 z-50">
                    <div className="bg-white border border-[#EBE0D8] rounded-xl shadow-lg overflow-hidden">
                      <Link href="/signup?type=homeowner"
                        onClick={() => setSignupOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[#2C1810] hover:bg-[#FAEEE9] hover:text-[#C0593A] transition-colors">
                        <span className="text-base">🏠</span>
                        <div>
                          <p className="font-semibold text-xs">Homeowner</p>
                          <p className="text-[11px] text-[#A08070]">Hire & buy materials</p>
                        </div>
                      </Link>
                      <div className="h-px bg-[#F0E8E2]" />
                      <Link href="/signup?type=professional"
                        onClick={() => setSignupOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[#2C1810] hover:bg-[#FAEEE9] hover:text-[#C0593A] transition-colors">
                        <span className="text-base">💼</span>
                        <div>
                          <p className="font-semibold text-xs">Professional</p>
                          <p className="text-[11px] text-[#A08070]">Work & sell on Griffy</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
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
            {[...MARKETPLACE_LINKS, ...DIRECT_LINKS].map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="text-gray-600 text-sm font-medium hover:text-[#C0593A] transition-colors py-1">
                {'icon' in l ? `${l.icon} ` : ''}{l.label}
              </Link>
            ))}
            <Link href="/search" onClick={() => setMenuOpen(false)}
              className="text-gray-600 text-sm font-medium hover:text-[#C0593A] transition-colors py-1">
              🔍 Search
            </Link>
            {user && (
              <>
                <Link href="/saved" onClick={() => setMenuOpen(false)}
                  className="text-gray-600 text-sm font-medium hover:text-[#C0593A] transition-colors py-1">
                  ♡ Saved
                </Link>
                <Link href="/cart" onClick={() => setMenuOpen(false)}
                  className="text-gray-600 text-sm font-medium hover:text-[#C0593A] transition-colors py-1">
                  🛒 Cart{cartCount > 0 ? ` (${cartCount})` : ''}
                </Link>
                <Link href="/notifications" onClick={() => setMenuOpen(false)}
                  className="text-gray-600 text-sm font-medium hover:text-[#C0593A] transition-colors py-1">
                  🔔 Notifications{unreadCount > 0 ? ` (${unreadCount})` : ''}
                </Link>
                <Link href="/messages" onClick={() => setMenuOpen(false)}
                  className="text-gray-600 text-sm font-medium hover:text-[#C0593A] transition-colors py-1">
                  💬 Messages{chatUnreadCount > 0 ? ` (${chatUnreadCount})` : ''}
                </Link>
              </>
            )}
            <div className="border-t border-[#f0ebe6] pt-4 flex flex-col gap-3">
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="text-xs text-gray-400 hover:text-[#C0593A]">
                    {user.name}
                  </Link>
                  <Link href="/orders" onClick={() => setMenuOpen(false)}
                    className="text-sm font-semibold text-[#C0593A] py-1">
                    Orders
                  </Link>
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
                  <Link href="/signup?type=homeowner" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 text-sm font-semibold bg-[#C0593A] text-white px-4 py-2.5 rounded-lg">
                    🏠 Sign up as Homeowner
                  </Link>
                  <Link href="/signup?type=professional" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 text-sm font-semibold border-2 border-[#C0593A] text-[#C0593A] px-4 py-2.5 rounded-lg">
                    💼 Sign up as Professional
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

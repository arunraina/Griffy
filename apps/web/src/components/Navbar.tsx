'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-provider';
import { isEnabled } from '@/lib/featureFlags';
import { useCart } from '@/context/CartContext';
import { useNotifications } from '@/context/NotificationContext';
import { useChat } from '@/context/ChatContext';
import SearchBar from './SearchBar';
import Logo from './Logo';

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
  const { user: authUser, me, isAdmin, signOut } = useAuth();
  const MARKETPLACE_LINKS = getMarketplaceLinks();
  const { count: cartCount } = useCart();
  const { unreadCount } = useNotifications();
  const { unreadCount: chatUnreadCount } = useChat();

  const [menuOpen,      setMenuOpen]      = useState(false);
  const [signupOpen,    setSignupOpen]    = useState(false);
  const [marketOpen,    setMarketOpen]    = useState(false);
  const [accountOpen,   setAccountOpen]   = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // AuthProvider already resolves `authUser` fast (a local/cheap session read)
  // and `me` a moment later (the one shared GET /users/me for the whole app)
  // — showing the name off authUser means the dropdown trigger appears
  // immediately instead of waiting on that second round trip.
  const user = authUser
    ? { name: me?.name ?? authUser.user_metadata?.name ?? authUser.email?.split('@')[0] ?? 'User' }
    : null;
  const DIRECT_LINKS = getDirectLinks(!!user);

  async function handleLogout() {
    setMenuOpen(false);
    setAccountOpen(false);
    await signOut(); // navigates to /login itself
  }

  return (
    <nav className="bg-white border-b border-[#f0ebe6] sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0 mr-8">
          <Logo size={32} wordmarkClassName="text-[#2C1810] font-bold tracking-tight" />
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
          {user ? (
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setAccountOpen((o) => !o)}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#C0593A] transition-colors pl-2 pr-1 py-1.5 rounded-lg hover:bg-[#FAEEE9]"
              >
                <span className="max-w-[120px] truncate font-medium">{user.name}</span>
                {(cartCount > 0 || chatUnreadCount > 0 || unreadCount > 0) && (
                  <span className="bg-[#C0593A] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount + chatUnreadCount + unreadCount > 9 ? '9+' : cartCount + chatUnreadCount + unreadCount}
                  </span>
                )}
                <svg className={`w-3 h-3 transition-transform ${accountOpen ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-full pt-2 w-56 z-50">
                  <div className="bg-white border border-[#EBE0D8] rounded-xl shadow-lg overflow-hidden py-1.5">
                    <Link href="/profile" onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2C1810] hover:bg-[#FAEEE9] hover:text-[#C0593A] transition-colors">
                      <span className="text-base">👤</span> Profile
                    </Link>
                    <Link href="/orders" onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2C1810] hover:bg-[#FAEEE9] hover:text-[#C0593A] transition-colors">
                      <span className="text-base">📦</span> Orders
                    </Link>
                    <Link href="/home" onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2C1810] hover:bg-[#FAEEE9] hover:text-[#C0593A] transition-colors">
                      <span className="text-base">📊</span> Dashboard
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#9E3F24] hover:bg-[#FAEEE9] transition-colors">
                        <span className="text-base">🛠️</span> Admin
                      </Link>
                    )}
                    <div className="h-px bg-[#F0E8E2] my-1" />
                    <Link href="/saved" onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2C1810] hover:bg-[#FAEEE9] hover:text-[#C0593A] transition-colors">
                      <span className="text-base">♡</span> Saved
                    </Link>
                    <Link href="/cart" onClick={() => setAccountOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-sm text-[#2C1810] hover:bg-[#FAEEE9] hover:text-[#C0593A] transition-colors">
                      <span className="flex items-center gap-3"><span className="text-base">🛒</span> Cart</span>
                      {cartCount > 0 && <span className="text-xs font-bold text-[#C0593A]">{cartCount}</span>}
                    </Link>
                    <Link href="/messages" onClick={() => setAccountOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-sm text-[#2C1810] hover:bg-[#FAEEE9] hover:text-[#C0593A] transition-colors">
                      <span className="flex items-center gap-3"><span className="text-base">💬</span> Messages</span>
                      {chatUnreadCount > 0 && <span className="text-xs font-bold text-[#C0593A]">{chatUnreadCount}</span>}
                    </Link>
                    <Link href="/notifications" onClick={() => setAccountOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-sm text-[#2C1810] hover:bg-[#FAEEE9] hover:text-[#C0593A] transition-colors">
                      <span className="flex items-center gap-3"><span className="text-base">🔔</span> Notifications</span>
                      {unreadCount > 0 && <span className="text-xs font-bold text-[#C0593A]">{unreadCount}</span>}
                    </Link>
                    <div className="h-px bg-[#F0E8E2] my-1" />
                    <button onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#C0593A] hover:bg-[#FAEEE9] transition-colors">
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
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
                        <span className="text-base">🏗️</span>
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
                  <Link href="/home" onClick={() => setMenuOpen(false)}
                    className="text-sm font-semibold text-[#C0593A] py-1">
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMenuOpen(false)}
                      className="text-sm font-semibold text-[#9E3F24] py-1">
                      Admin Panel
                    </Link>
                  )}
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
                    🏗️ Sign up as Professional
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

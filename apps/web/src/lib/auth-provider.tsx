'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase';
import { signOut as authSignOut } from '@/lib/auth';
import { fetchMe, type Me } from '@/lib/users';

interface AuthContextValue {
  user: User | null;
  me: Me | null;
  role: string | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [me, setMe]           = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  // getSession()'s initial check and onAuthStateChange's immediate
  // INITIAL_SESSION event both fire for the very first load — without this,
  // every page load issued two redundant GET /users/me calls (and every
  // component that separately called fetchMe() added its own on top of
  // that; see Navbar/HomeHero, now consumers of this context instead).
  // Track which user we've already fetched for so a second callback for the
  // same session is a no-op.
  const fetchedForRef = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    function loadMe(userId: string) {
      if (fetchedForRef.current === userId) return;
      fetchedForRef.current = userId;
      fetchMe().then(setMe).catch(() => setMe(null));
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        loadMe(session.user.id);
      }
      setLoading(false);
    });

    // Covers every auth method (Google, email, phone) since they all end in
    // a supabase.auth.setSession()/signIn call that fires this listener.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        loadMe(session.user.id);
      } else {
        setUser(null);
        setMe(null);
        fetchedForRef.current = null;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, me, role: me?.role ?? null, isAdmin: !!me?.adminRole, loading, signOut: authSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

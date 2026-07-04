'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase';
import { fetchUnreadCount } from '@/lib/notifications';

interface NotificationContextType {
  unreadCount: number;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationContextType>({ unreadCount: 0, refresh: () => {} });

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => setAuthed(!!session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => setAuthed(!!session));
    return () => listener.subscription.unsubscribe();
  }, []);

  const refresh = useCallback(() => {
    if (!authed) {
      setUnreadCount(0);
      return;
    }
    fetchUnreadCount().then(setUnreadCount).catch(() => undefined);
  }, [authed]);

  useEffect(() => {
    refresh();
    if (!authed) return;
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [authed, refresh]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}

'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase';
import { fetchUnreadChatCount } from '@/lib/chat';

interface ChatContextType {
  unreadCount: number;
  refresh: () => void;
}

const ChatContext = createContext<ChatContextType>({ unreadCount: 0, refresh: () => {} });

export function ChatProvider({ children }: { children: ReactNode }) {
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
    fetchUnreadChatCount().then(setUnreadCount).catch(() => undefined);
  }, [authed]);

  useEffect(() => {
    refresh();
    if (!authed) return;
    const interval = setInterval(refresh, 20_000);
    return () => clearInterval(interval);
  }, [authed, refresh]);

  return (
    <ChatContext.Provider value={{ unreadCount, refresh }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}

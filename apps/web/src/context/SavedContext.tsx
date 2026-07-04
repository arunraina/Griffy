'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SavedType = 'material' | 'contractor' | 'labour' | 'service_expert';

export interface SavedItem {
  type: SavedType;
  id: string;
  title: string;
  subtitle: string;
  href: string;
  emoji: string;
  savedAt: number;
}

const STORAGE_KEY = 'griffy_saved';

function persist(items: SavedItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable — saved list just won't persist */
  }
}

function keyOf(type: SavedType, id: string) {
  return `${type}:${id}`;
}

interface SavedContextType {
  items: SavedItem[];
  isSaved: (type: SavedType, id: string) => boolean;
  toggle: (item: Omit<SavedItem, 'savedAt'>) => void;
  remove: (type: SavedType, id: string) => void;
}

const SavedContext = createContext<SavedContextType | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SavedItem[]>([]);

  // Server and first client render both start empty (avoids a hydration
  // mismatch); pick up any stored list right after mount.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      /* ignore malformed saved list in storage */
    }
  }, []);

  function isSaved(type: SavedType, id: string) {
    const k = keyOf(type, id);
    return items.some((i) => keyOf(i.type, i.id) === k);
  }

  function toggle(item: Omit<SavedItem, 'savedAt'>) {
    setItems((prev) => {
      const k = keyOf(item.type, item.id);
      const exists = prev.some((i) => keyOf(i.type, i.id) === k);
      const next = exists
        ? prev.filter((i) => keyOf(i.type, i.id) !== k)
        : [...prev, { ...item, savedAt: Date.now() }];
      persist(next);
      return next;
    });
  }

  function remove(type: SavedType, id: string) {
    setItems((prev) => {
      const next = prev.filter((i) => keyOf(i.type, i.id) !== keyOf(type, id));
      persist(next);
      return next;
    });
  }

  return (
    <SavedContext.Provider value={{ items, isSaved, toggle, remove }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error('useSaved must be used inside SavedProvider');
  return ctx;
}

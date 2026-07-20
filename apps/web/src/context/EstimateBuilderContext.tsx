'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { EstimatorCartLine } from '@/lib/estimatorCart';

export interface EstimateEntry {
  id: string;
  source: string;
  sourceLabel: string;
  description: string;
  lines: EstimatorCartLine[];
  estimatedCost: number;
  unmatched: string[];
  addedAt: number;
}

const STORAGE_KEY = 'griffy_estimate_builder';

function persist(entries: EstimateEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* storage unavailable (private mode, quota, etc.) — estimate just won't persist */
  }
}

interface EstimateBuilderContextType {
  entries: EstimateEntry[];
  addEntry: (entry: Omit<EstimateEntry, 'id' | 'addedAt'>) => void;
  removeEntry: (id: string) => void;
  clearAll: () => void;
  total: number;
  count: number;
}

const EstimateBuilderContext = createContext<EstimateBuilderContextType | null>(null);

export function EstimateBuilderProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<EstimateEntry[]>([]);

  // Server and first client render both start empty (avoids an SSR/client
  // hydration mismatch); pick up any stored entries right after mount.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setEntries(JSON.parse(stored));
    } catch {
      /* ignore malformed data in storage */
    }
  }, []);

  function addEntry(entry: Omit<EstimateEntry, 'id' | 'addedAt'>) {
    setEntries((prev) => {
      const next = [...prev, { ...entry, id: crypto.randomUUID(), addedAt: Date.now() }];
      persist(next);
      return next;
    });
  }

  function removeEntry(id: string) {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      persist(next);
      return next;
    });
  }

  function clearAll() {
    setEntries([]);
    persist([]);
  }

  const total = entries.reduce((s, e) => s + e.estimatedCost, 0);

  return (
    <EstimateBuilderContext.Provider
      value={{ entries, addEntry, removeEntry, clearAll, total, count: entries.length }}
    >
      {children}
    </EstimateBuilderContext.Provider>
  );
}

export function useEstimateBuilder() {
  const ctx = useContext(EstimateBuilderContext);
  if (!ctx) throw new Error('useEstimateBuilder must be used inside EstimateBuilderProvider');
  return ctx;
}

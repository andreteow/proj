"use client";
import { create } from 'zustand';

export interface LeaderboardEntry { id: string; date: string; ms: number }

type Store = {
  entries: LeaderboardEntry[];
  add: (ms: number, date?: string) => void;
  clear: () => void;
  loaded: boolean;
  _load: () => void;
};

const STORAGE_KEY = 'kk_titi_leaderboard_v1';

export const useLeaderboardStore = create<Store>((set, get) => ({
  entries: [],
  loaded: false,
  _load: () => {
    if (get().loaded) return;
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const entries: LeaderboardEntry[] = JSON.parse(raw);
        set({ entries, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },
  add: (ms, date) => {
    const d = date ?? new Date().toISOString();
    const id = `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const entries = [...get().entries, { id, date: d, ms }]
      .sort((a, b) => a.ms - b.ms)
      .slice(0, 50);
    set({ entries });
    if (typeof window !== 'undefined') {
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch {}
    }
  },
  clear: () => {
    set({ entries: [] });
    if (typeof window !== 'undefined') {
      try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
    }
  },
}));

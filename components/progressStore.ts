"use client";
import { create } from 'zustand';

export const useProgressStore = create<{
  // checkpoints
  checkedIn: boolean; consulted: boolean; gotMeds: boolean;
  setCheckedIn: () => void; setConsulted: () => void; setGotMeds: () => void;
  reset: () => void;
  // assigned consult target (1..4) after registration
  targetConsult: number | null;
  assignConsultTarget: () => number;
  // timer
  running: boolean;
  startAt: number | null; // epoch ms
  elapsedMs: number; // accumulated when stopped
  start: () => void;
  stop: () => void;
  resetTimer: () => void;
}>((set) => ({
  // checkpoints
  checkedIn: false,
  consulted: false,
  gotMeds: false,
  setCheckedIn: () => set({ checkedIn: true }),
  setConsulted: () => set({ consulted: true }),
  setGotMeds: () => set({ gotMeds: true }),
  reset: () => set({ checkedIn: false, consulted: false, gotMeds: false, targetConsult: null }),
  // consult assignment
  targetConsult: null,
  assignConsultTarget: () => {
    const n = 1 + Math.floor(Math.random() * 4);
    set({ targetConsult: n });
    return n;
  },
  // timer
  running: false,
  startAt: null,
  elapsedMs: 0,
  start: () => set((s) => s.running ? s : { running: true, startAt: Date.now() }),
  stop: () => set((s) => s.running && s.startAt != null
    ? { running: false, elapsedMs: s.elapsedMs + (Date.now() - (s.startAt as number)), startAt: null }
    : s
  ),
  resetTimer: () => set({ running: false, startAt: null, elapsedMs: 0 }),
}));

"use client";
import { create } from 'zustand';

export const usePlayerStore = create<{ x: number; z: number; set: (x: number, z: number) => void }>((set) => ({
  x: 0, z: 0,
  set: (x, z) => set({ x, z }),
}));

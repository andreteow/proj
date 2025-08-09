"use client";
import { create } from 'zustand';

export const usePlayerStore = create<{
  x: number;
  z: number;
  yaw: number; // radians, heading around Y axis
  set: (x: number, z: number) => void;
  setYaw: (yaw: number) => void;
  hint: string | null;
  setHint: (h: string | null) => void;
  spawnX: number;
  spawnZ: number;
  setSpawn: (x: number, z: number) => void;
  resetToken: number;
  requestReset: () => void;
}>((set) => ({
  x: 0,
  z: 0,
  yaw: 0,
  set: (x, z) => set({ x, z }),
  setYaw: (yaw) => set({ yaw }),
  hint: null,
  setHint: (h) => set({ hint: h }),
  spawnX: 0,
  spawnZ: 6,
  setSpawn: (x, z) => set({ spawnX: x, spawnZ: z }),
  resetToken: 0,
  requestReset: () => set((s) => ({ resetToken: s.resetToken + 1 })),
}));

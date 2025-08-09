"use client";
import { create } from 'zustand';

export const useProgressStore = create<{
  checkedIn: boolean; consulted: boolean; gotMeds: boolean;
  setCheckedIn: () => void; setConsulted: () => void; setGotMeds: () => void;
}>((set) => ({
  checkedIn: false, consulted: false, gotMeds: false,
  setCheckedIn: () => set({ checkedIn: true }),
  setConsulted: () => set({ consulted: true }),
  setGotMeds: () => set({ gotMeds: true }),
}));

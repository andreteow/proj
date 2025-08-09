"use client";

import { useEffect, useState } from 'react';
import { useProgressStore } from '@/components/progressStore';

export function HUD() {
  const p = useProgressStore();
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const onLock = () => setLocked(true);
    const onUnlock = () => setLocked(false);
    const onPointerLockChange = () => {
      const l = document.pointerLockElement != null; setLocked(l);
    };
    window.addEventListener('pointerlockchange', onPointerLockChange);
    window.addEventListener('pointerlockerror', onUnlock);
    return () => {
      window.removeEventListener('pointerlockchange', onPointerLockChange);
      window.removeEventListener('pointerlockerror', onUnlock);
    };
  }, []);

  return (
    <div id="hud">
      <h1>KK Titiwangsa – Walkthrough (MVP)</h1>
      <p><strong>Controls</strong>: Click canvas to lock view. WASD to move. Shift to run. M to toggle mini‑map.</p>
      <p><strong>Objective</strong>: Check‑in → Consult → Pharmacy</p>
      <div className="steps">
        <div className="step"><span className={p.checkedIn ? 'done' : ''}>✔</span> 1) Daftar di Pendaftaran</div>
        <div className="step"><span className={p.consulted ? 'done' : ''}>✔</span> 2) Jumpa doktor (mana‑mana bilik konsultasi)</div>
        <div className="step"><span className={p.gotMeds ? 'done' : ''}>✔</span> 3) Ambil ubat di Farmasi</div>
      </div>
    </div>
  );
}

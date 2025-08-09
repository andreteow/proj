"use client";

import { useEffect, useMemo, useState } from 'react';
import { useProgressStore } from '@/components/progressStore';
import { usePlayerStore } from '@/components/playerStore';

export function HUD() {
  const p = useProgressStore();
  const hint = usePlayerStore((s) => s.hint);
  const requestReset = usePlayerStore((s) => s.requestReset);

  // Timer display ticks ~10Hz when running
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!p.running) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [p.running]);

  const elapsed = useMemo(() => {
    const base = p.elapsedMs;
    if (p.running && p.startAt != null) return base + (now - p.startAt);
    return base;
  }, [p.elapsedMs, p.running, p.startAt, now]);

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    const cs = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2,'0')}:${String(rem).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
  };

  const onNewGame = () => {
    p.resetTimer();
    p.reset();
    requestReset();
  };

  return (
    <div id="hud">
      <h1>KK Titiwangsa – Walkthrough</h1>
      <p><strong>Controls</strong>: WASD to move. ←/→ to look. Shift to run. E to interact. M to toggle mini‑map.</p>
      <p><strong>Objective</strong>: Daftar → Jumpa Doktor → Ambil Ubat</p>
      <p><strong>Timer</strong>: {fmt(elapsed)} {p.running ? '(sedang berjalan)' : ''} {p.checkedIn && p.consulted && p.gotMeds ? ' — Selesai! 🎉' : ''}</p>
      <div className="steps">
        <div className="step"><span className={p.checkedIn ? 'done' : ''}>✔</span> 1) Daftar di Pendaftaran</div>
        <div className="step"><span className={p.consulted ? 'done' : ''}>✔</span> 2) Jumpa doktor (mana‑mana bilik konsultasi)</div>
        <div className="step"><span className={p.gotMeds ? 'done' : ''}>✔</span> 3) Ambil ubat di Farmasi</div>
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <button onClick={onNewGame}>New Game</button>
      </div>
      {hint && (
        <div id="hint" aria-live="polite">{hint}</div>
      )}
    </div>
  );
}

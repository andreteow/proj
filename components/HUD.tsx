"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useProgressStore } from '@/components/progressStore';
import { usePlayerStore } from '@/components/playerStore';
import { useLeaderboardStore } from '@/components/leaderboardStore';

export function HUD() {
  const p = useProgressStore();
  const hint = usePlayerStore((s) => s.hint);
  const requestReset = usePlayerStore((s) => s.requestReset);
  const lb = useLeaderboardStore();
  // Load leaderboard once on mount
  useEffect(() => { lb._load(); }, []);

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

  // When finished, add to leaderboard once
  const addedRef = useRef(false);
  const finished = p.checkedIn && p.consulted && p.gotMeds && !p.running;
  useEffect(() => {
    if (finished && !addedRef.current) {
      lb.add(elapsed);
      addedRef.current = true;
    }
  }, [finished, elapsed]);

  const onNewGame = () => {
    p.resetTimer();
    p.reset();
    requestReset();
    addedRef.current = false;
  };

  return (
    <div id="hud">
      <h1>KK Titiwangsa – Walkthrough</h1>
      <p><strong>Controls</strong>: WASD to move. ←/→ to look. Shift to run. E to interact. M to toggle mini‑map.</p>
      <p><strong>Objective</strong>: Daftar → Jumpa Doktor → Ambil Ubat</p>
      <p><strong>Timer</strong>: {fmt(elapsed)} {p.running ? '(sedang berjalan)' : ''} {p.checkedIn && p.consulted && p.gotMeds ? ' — Selesai! 🎉' : ''}</p>
      <div className="steps">
        <div className="step"><span className={p.checkedIn ? 'done' : ''}>✔</span> 1) Daftar di Pendaftaran</div>
        <div className="step"><span className={p.consulted ? 'done' : ''}>✔</span> 2) Jumpa doktor {p.targetConsult ? `(Bilik Konsultasi ${p.targetConsult})` : '(bilik akan diberikan selepas daftar)'}</div>
        <div className="step"><span className={p.gotMeds ? 'done' : ''}>✔</span> 3) Ambil ubat di Farmasi</div>
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <button onClick={onNewGame}>{finished ? 'Main Lagi' : 'New Game'}</button>
      </div>
      {hint && (
        <div id="hint" aria-live="polite">{hint}</div>
      )}
      {finished && (
        <div style={{ marginTop: 10 }}>
          <h2 style={{ fontSize: 14, margin: '6px 0' }}>Leaderboard (Masa Terpantas)</h2>
          <div style={{ maxHeight: 200, overflow: 'auto', background: 'rgba(255,255,255,0.6)', borderRadius: 6, padding: 6 }}>
            {lb.entries.length === 0 && <div>Tiada rekod lagi.</div>}
            {lb.entries.slice(0, 10).map((e, i) => (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '2px 0', borderBottom: '1px dashed rgba(0,0,0,0.08)' }}>
                <span>#{i + 1}</span>
                <span>{fmt(e.ms)}</span>
                <span>{new Date(e.date).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 6 }}>
            <button onClick={() => lb.clear()} style={{ fontSize: 12, padding: '4px 8px' }}>Clear Leaderboard</button>
          </div>
        </div>
      )}
    </div>
  );
}

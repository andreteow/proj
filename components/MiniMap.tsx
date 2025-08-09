"use client";

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { usePlayerStore } from '@/components/playerStore';
import { layout as L, cfg } from '@/components/sharedLayout';

// Shared randomized layout instance

export function MiniMap() {
  const { x, z, yaw } = usePlayerStore();
  const [open, setOpen] = useState(false);
  // Panel dimensions
  const size = 180; // px (circle)
  const padding = 8; // inner padding
  const worldW = cfg.floorSize.w;
  const worldH = cfg.floorSize.h;
  // Scale entire world to fit a base box; we'll translate to keep player centered
  const scale = Math.min((size - padding * 2) / worldW, (size - padding * 2) / worldH);
  const worldPxW = worldW * scale;
  const worldPxH = worldH * scale;
  const centerX = size / 2;
  const centerY = size / 2;
  const playerWorldPxX = (x + worldW / 2) * scale;
  const playerWorldPxY = (z + worldH / 2) * scale;
  const translateX = centerX - playerWorldPxX;
  const translateY = centerY - playerWorldPxY;

  return (
    <>
    <div id="minimap" style={{ width: size, height: size, cursor: 'pointer' }} onClick={() => setOpen(true)} title="Klik untuk peta penuh">
      <div
        className="map world"
        style={{
          width: worldPxW,
          height: worldPxH,
          transform: `translate(${translateX}px, ${translateY}px) rotate(${-yaw}rad)`,
          transformOrigin: 'center center',
        }}
      >
        {L.rooms.map((r) => {
          const left = (r.x - r.w / 2 + worldW / 2) * scale;
          const top = (r.z - r.h / 2 + worldH / 2) * scale;
          const w = r.w * scale;
          const h = r.h * scale;
          return (
            <div key={r.key} className="room" style={{ left, top, width: w, height: h }} title={r.name}>
              {r.name}
            </div>
          );
        })}
      </div>
      {/* Player arrow fixed in center, pointing up */}
      <div className="playerArrow" style={{ left: centerX, top: centerY }} />
    </div>
    {open && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 30 }} onClick={() => setOpen(false)}>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.9)', padding: 12, borderRadius: 8, maxWidth: '90vw', maxHeight: '85vh', boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <strong>Peta Klinik – Pandangan Atas</strong>
              <button onClick={() => setOpen(false)} style={{ padding: '4px 8px' }}>Tutup</button>
            </div>
            {/* Full map content */}
            <FullMap />
          </div>
        </div>
      </div>
    )}
    </>
  );
}

function FullMap() {
  const worldW = cfg.floorSize.w;
  const worldH = cfg.floorSize.h;
  // Fit into container 80vw x 70vh (approx), but here we let CSS define max and compute based on actual client size via memo with fallbacks.
  // For simplicity, use fixed size container that likely fits most screens.
  const W = 800; const H = 520;
  const scale = Math.min(W / worldW, H / worldH);
  const worldPxW = worldW * scale;
  const worldPxH = worldH * scale;
  const style: CSSProperties = { position: 'relative', width: worldPxW, height: worldPxH, background: 'rgba(0,0,0,0.5)', borderRadius: 6 };
  return (
    <div style={style}>
      {L.rooms.map((r) => {
        const left = (r.x - r.w / 2 + worldW / 2) * scale;
        const top = (r.z - r.h / 2 + worldH / 2) * scale;
        const w = r.w * scale;
        const h = r.h * scale;
        return (
          <div key={r.key} className="room" style={{ position: 'absolute', left, top, width: w, height: h, border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 12, padding: '2px 3px' }} title={r.name}>
            {r.name}
          </div>
        );
      })}
    </div>
  );
}

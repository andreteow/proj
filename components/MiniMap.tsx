"use client";

import layout from '@/data/kk-titiwangsa';
import { sanitizeLayout } from '@/lib/layout';
import { usePlayerStore } from '@/components/playerStore';

const { layout: L, cfg } = sanitizeLayout(layout);

export function MiniMap() {
  const { x, z, yaw } = usePlayerStore();
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
    <div id="minimap" style={{ width: size, height: size }}>
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
  );
}

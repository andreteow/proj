"use client";

import layout from '@/data/kk-titiwangsa';
import { sanitizeLayout } from '@/lib/layout';
import { usePlayerStore } from '@/components/playerStore';

const { layout: L, cfg } = sanitizeLayout(layout);

export function MiniMap() {
  const { x, z } = usePlayerStore();
  const scaleX = 200 / cfg.floorSize.w;
  const scaleZ = 140 / cfg.floorSize.h;
  const originX = 10; // padding inside panel
  const originZ = 10;

  return (
    <div id="minimap">
      <div className="map">
        {L.rooms.map((r) => {
          const left = originX + (r.x - r.w/2 + cfg.floorSize.w/2) * scaleX;
          const top = originZ + (r.z - r.h/2 + cfg.floorSize.h/2) * scaleZ;
          const w = r.w * scaleX;
          const h = r.h * scaleZ;
          return (
            <div key={r.key} className="room" style={{ left, top, width: w, height: h }} title={r.name}>
              {r.name}
            </div>
          );
        })}
        <div className="player" style={{
          left: originX + (x + cfg.floorSize.w/2) * scaleX,
          top: originZ + (z + cfg.floorSize.h/2) * scaleZ
        }} />
      </div>
    </div>
  );
}

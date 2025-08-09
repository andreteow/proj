import type { Door, Furniture, Layout, Room, WorldConfig } from './types';

export function sanitizeLayout(input: Layout): { layout: Layout; cfg: WorldConfig } {
  const wallHeight = isFinite(input.wallHeight as number) ? (input.wallHeight as number) : 3;
  const wallThickness = isFinite(input.wallThickness as number) ? (input.wallThickness as number) : 0.2;
  const floorSize = input.floorSize && isFinite(input.floorSize.w) && isFinite(input.floorSize.h)
    ? input.floorSize
    : { w: 60, h: 40 };

  const safeRooms: Room[] = (input.rooms || []).map((r, i) => ({
    key: r.key ?? `room_${i}`,
    name: String(r.name || `Room ${i+1}`),
    x: finiteOr(r.x, 0),
    z: finiteOr(r.z, 0),
    w: clamp(finiteOr(r.w, 4), 1, 50),
    h: clamp(finiteOr(r.h, 4), 1, 50),
    doors: (r.doors || []).map(safeDoor),
    furniture: (r.furniture || []).map(safeFurniture)
  }));

  const corridors = (input.corridors || []).map(c => ({
    x: finiteOr(c.x, 0), z: finiteOr(c.z, 0), w: clamp(finiteOr(c.w, 2), 1, 60), h: clamp(finiteOr(c.h, 2), 1, 60)
  }));

  return {
    layout: {
      name: input.name || 'Klinik Kesihatan Titiwangsa (Approx)',
      wallHeight, wallThickness, floorSize,
      rooms: safeRooms,
      corridors
    },
    cfg: { wallHeight, wallThickness, floorSize }
  };
}

function finiteOr(v: any, d: number) { return Number.isFinite(v) ? Number(v) : d; }
function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }

function safeDoor(d: Door): Door {
  const side = (['N','S','E','W'] as const).includes(d.side as any) ? d.side : 'N';
  return {
    side,
    offset: clamp(finiteOr(d.offset, 0.5), 0, 100),
    width: clamp(finiteOr(d.width, 1), 0.8, 5)
  };
}

function safeFurniture(f: Furniture): Furniture {
  const allowed = new Set(['bench','counter','kiosk','desk','chair','cabinet','shelf','screen','bed','table','partition','carpet','benchLab','sign']);
  const type = allowed.has(f.type as any) ? f.type : '__unknown__';
  return {
    type,
    x: finiteOr(f.x, 0), z: finiteOr(f.z, 0),
    w: finiteOr(f.w, 1), h: finiteOr(f.h, 1), y: finiteOr(f.y, 0),
    label: f.label ? String(f.label) : undefined
  };
}

export function aabbContains(px: number, pz: number, x: number, z: number, w: number, h: number) {
  return px >= x - w/2 && px <= x + w/2 && pz >= z - h/2 && pz <= z + h/2;
}

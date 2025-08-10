"use client";

import { Html } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { useEffect, useState } from 'react';
import type { Door, Furniture, Room } from '@/lib/types';
import { Player } from '@/components/Player';
import { usePlayerStore } from '@/components/playerStore';
import { NPCs } from '@/components/NPCs';
import { layout, cfg } from '@/components/sharedLayout';

// Capture original room slots for randomization across ALL rooms
const ROOM_SLOTS = (() => {
  return layout.rooms.map((r) => ({
    x: r.x, z: r.z, w: r.w, h: r.h,
    doors: (r.doors || []).map(d => ({ side: d.side, offset: d.offset, width: d.width }))
  }));
})();

function seededRand(seed: number) {
  // Mulberry32
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function randomizeAllRooms(seed: number) {
  if (layout.rooms.length !== ROOM_SLOTS.length) return;
  const rnd = seededRand(seed || 1);
  const idx = [...ROOM_SLOTS.keys()];
  // Fisher–Yates shuffle over ALL slots
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  layout.rooms.forEach((r, i) => {
    const s = ROOM_SLOTS[idx[i]];
    r.x = s.x; r.z = s.z; r.w = s.w; r.h = s.h; r.doors = s.doors.map(d => ({ ...d }));
  });
}

// Ensure each room has at least one door that faces the nearest corridor
function ensureDoorsTowardCorridors() {
  if (!layout.corridors?.length) return;
  const corridors = layout.corridors.map(c => ({
    x0: c.x - c.w / 2,
    x1: c.x + c.w / 2,
    z0: c.z - c.h / 2,
    z1: c.z + c.h / 2,
    cx: c.x,
    cz: c.z,
  }));

  for (const r of layout.rooms) {
    const x0 = r.x - r.w / 2;
    const x1 = r.x + r.w / 2;
    const z0 = r.z - r.h / 2;
    const z1 = r.z + r.h / 2;
    let chosenSide: 'N'|'S'|'W'|'E' = 'N';
    let chosenOffset = 0;
    let chosenDist = Number.POSITIVE_INFINITY;
    const consider = (side: 'N'|'S'|'W'|'E', px: number, pz: number, length: number) => {
      for (const c of corridors) {
        const nx = Math.max(c.x0, Math.min(px, c.x1));
        const nz = Math.max(c.z0, Math.min(pz, c.z1));
        const dx = nx - px; const dz = nz - pz;
        const d2 = dx*dx + dz*dz;
        const dist = Math.sqrt(d2);
        // projected offset along this side toward corridor point
        const off = side === 'N' || side === 'S' ? (nx - x0) : (nz - z0);
        const offset = Math.max(0, Math.min(off, length));
        if (dist < chosenDist) { chosenDist = dist; chosenSide = side; chosenOffset = offset; }
      }
    };

    // Check centers of each wall
    consider('N', r.x, z0, r.w);
    consider('S', r.x, z1, r.w);
    consider('W', x0, r.z, r.h);
    consider('E', x1, r.z, r.h);

    // Ensure a single reasonable width doorway toward corridor
    const width = Math.min(Math.max(1.2, (r.w + r.h) * 0.04), 2.2); // 1.2m–2.2m
    r.doors = [{ side: chosenSide, offset: chosenOffset, width }];
  }
}

export function ClinicScene() {
  const resetToken = usePlayerStore((s) => s.resetToken);
  const setSpawn = usePlayerStore((s) => s.setSpawn);
  const [randVersion, setRandVersion] = useState(0);
  useEffect(() => {
    // Randomize ALL rooms on each new game (deterministic per reset burst)
    const baseSeed = (resetToken + (Date.now() % 1000)) | 0;
    randomizeAllRooms(baseSeed ^ 0x9e3779b9);
    ensureDoorsTowardCorridors();
    // Compute spawn just outside cafeteria door
    const cafe = layout.rooms.find(r => r.key === 'cafeteria');
    if (cafe) {
      const t = cfg.wallThickness;
      const x0 = cafe.x - cafe.w / 2;
      const x1 = cafe.x + cafe.w / 2;
      const z0 = cafe.z - cafe.h / 2;
      const z1 = cafe.z + cafe.h / 2;
      const d = (cafe.doors && cafe.doors[0]) || undefined;
      if (d) {
        const OUT = 0.75 + t / 2; // stand ~0.75m outside the doorway
        const off = Math.max(0, Math.min(d.offset, d.side === 'N' || d.side === 'S' ? cafe.w : cafe.h));
        let sx = cafe.x, sz = cafe.z;
        if (d.side === 'N') { sx = x0 + off; sz = z0 - OUT; }
        if (d.side === 'S') { sx = x0 + off; sz = z1 + OUT; }
        if (d.side === 'W') { sx = x0 - OUT; sz = z0 + off; }
        if (d.side === 'E') { sx = x1 + OUT; sz = z0 + off; }
        setSpawn(sx, sz);
      } else {
        // Fallback: north side outside center
        setSpawn(cafe.x, z0 - 0.8);
      }
    }
    setRandVersion((v) => v + 1);
  }, [resetToken]);
  return (
    <>
      <hemisphereLight intensity={0.85} groundColor={0xcad9e6} color={0xf5f7fb} />
      <directionalLight position={[14, 16, 10]} castShadow intensity={0.65} color={0xffffff} />
      <Physics debug={false} gravity={[0, -9.81, 0]}>
        <WorldBounds />
        <Corridors />
        <Rooms />
        <FurnitureAll />
        <NPCs layout={layout} />
        <Player />
      </Physics>
    </>
  );
}

function WorldBounds() {
  const t = cfg.wallThickness;
  const wh = cfg.wallHeight;
  const W = cfg.floorSize.w;
  const H = cfg.floorSize.h;
  return (
    <RigidBody type="fixed" colliders={false}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#f1f5fb" />
      </mesh>
      {/* Floor collider */}
      <CuboidCollider args={[W / 2, 0.05, H / 2]} position={[0, 0, 0]} />
      {/* Border walls */}
      {/* North */}
      <mesh position={[0, wh / 2, -H / 2]} castShadow>
        <boxGeometry args={[W, wh, t]} />
        <meshStandardMaterial color="#c6d6e6" />
      </mesh>
      <CuboidCollider args={[W / 2, wh / 2, t / 2]} position={[0, wh / 2, -H / 2]} />
      {/* South */}
      <mesh position={[0, wh / 2, H / 2]} castShadow>
        <boxGeometry args={[W, wh, t]} />
        <meshStandardMaterial color="#c6d6e6" />
      </mesh>
      <CuboidCollider args={[W / 2, wh / 2, t / 2]} position={[0, wh / 2, H / 2]} />
      {/* West */}
      <mesh position={[-W / 2, wh / 2, 0]} castShadow>
        <boxGeometry args={[t, wh, H]} />
        <meshStandardMaterial color="#c6d6e6" />
      </mesh>
      <CuboidCollider args={[t / 2, wh / 2, H / 2]} position={[-W / 2, wh / 2, 0]} />
      {/* East */}
      <mesh position={[W / 2, wh / 2, 0]} castShadow>
        <boxGeometry args={[t, wh, H]} />
        <meshStandardMaterial color="#c6d6e6" />
      </mesh>
      <CuboidCollider args={[t / 2, wh / 2, H / 2]} position={[W / 2, wh / 2, 0]} />
    </RigidBody>
  );
}

function Corridors() {
  if (!layout.corridors?.length) return null;
  return (
    <RigidBody type="fixed" colliders={false}>
      {layout.corridors.map((c, i) => (
        <mesh key={i} position={[c.x, 0.01, c.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[c.w, c.h]} />
          <meshStandardMaterial color="#dfe6eb" />
        </mesh>
      ))}
    </RigidBody>
  );
}

function Rooms() {
  return (
    <>
      {layout.rooms.map((r) => (
        <RoomGroup key={r.key} room={r} />
      ))}
    </>
  );
}

function RoomGroup({ room }: { room: Room }) {
  const t = cfg.wallThickness;
  const wh = cfg.wallHeight;
  const x0 = room.x - room.w / 2;
  const x1 = room.x + room.w / 2;
  const z0 = room.z - room.h / 2;
  const z1 = room.z + room.h / 2;
  const doors = new Map(room.doors?.map((d) => [d.side, d]) || []);

  return (
    <RigidBody type="fixed" colliders={false}>
      {/* Room floor tint */}
      <mesh position={[room.x, 0.005, room.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[room.w - t * 1.5, room.h - t * 1.5]} />
        <meshStandardMaterial color="#f4f6f8" />
      </mesh>

      {/* Walls with optional door opening */}
      <WallWithDoor orient="horizontal" x0={x0} x1={x1} z={z0} door={doors.get('N')} wh={wh} t={t} />
      <WallWithDoor orient="horizontal" x0={x0} x1={x1} z={z1} door={doors.get('S')} wh={wh} t={t} />
      <WallWithDoor orient="vertical" z0={z0} z1={z1} x={x0} door={doors.get('W')} wh={wh} t={t} />
      <WallWithDoor orient="vertical" z0={z0} z1={z1} x={x1} door={doors.get('E')} wh={wh} t={t} />

      {/* Door-mounted signage */}
      <DoorSigns room={room} />
    </RigidBody>
  );
}

function WallWithDoor(props: any) {
  const { orient, door, wh, t } = props as { orient: 'horizontal' | 'vertical'; door?: Door; wh: number; t: number };
  const parts: JSX.Element[] = [];

  if (orient === 'horizontal') {
    const { x0, x1, z } = props as { x0: number; x1: number; z: number };
    const len = x1 - x0;
    if (!door) {
      parts.push(
        <>
          <mesh position={[(x0 + x1) / 2, wh / 2, z]} castShadow>
            <boxGeometry args={[len, wh, t]} />
            <meshStandardMaterial color="#cfd7df" />
          </mesh>
          <CuboidCollider args={[len / 2, wh / 2, t / 2]} position={[(x0 + x1) / 2, wh / 2, z]} />
        </>
      );
    } else {
      const EDGE = 0.2; // keep small segments on both ends
      let half = Math.max((door.width || 1) / 2, 0.4);
      const maxHalf = Math.max(0, len / 2 - EDGE);
      if (half > maxHalf) half = maxHalf;
      const rawCx = x0 + Math.min(Math.max(door.offset ?? len / 2, 0), len);
      const minCx = x0 + EDGE + half;
      const maxCx = x1 - EDGE - half;
      const cx = Math.min(Math.max(rawCx, minCx), maxCx);
      const leftLen = Math.max(cx - half - x0, 0);
      const rightLen = Math.max(x1 - (cx + half), 0);
      if (leftLen > 0.01) {
        const lx = x0 + leftLen / 2;
        parts.push(
          <>
            <mesh position={[lx, wh / 2, z]} castShadow>
              <boxGeometry args={[leftLen, wh, t]} />
              <meshStandardMaterial color="#cfd7df" />
            </mesh>
            <CuboidCollider args={[leftLen / 2, wh / 2, t / 2]} position={[lx, wh / 2, z]} />
          </>
        );
      }
      if (rightLen > 0.01) {
        const rx = x1 - rightLen / 2;
        parts.push(
          <>
            <mesh position={[rx, wh / 2, z]} castShadow>
              <boxGeometry args={[rightLen, wh, t]} />
              <meshStandardMaterial color="#cfd7df" />
            </mesh>
            <CuboidCollider args={[rightLen / 2, wh / 2, t / 2]} position={[rx, wh / 2, z]} />
          </>
        );
      }
    }
  } else {
    const { z0, z1, x } = props as { z0: number; z1: number; x: number };
    const len = z1 - z0;
    if (!door) {
      parts.push(
        <>
          <mesh position={[x, wh / 2, (z0 + z1) / 2]} castShadow>
            <boxGeometry args={[t, wh, len]} />
            <meshStandardMaterial color="#cfd7df" />
          </mesh>
          <CuboidCollider args={[t / 2, wh / 2, len / 2]} position={[x, wh / 2, (z0 + z1) / 2]} />
        </>
      );
    } else {
      const EDGE = 0.2; // keep small segments on both ends
      let half = Math.max((door.width || 1) / 2, 0.4);
      const maxHalf = Math.max(0, len / 2 - EDGE);
      if (half > maxHalf) half = maxHalf;
      const rawCz = z0 + Math.min(Math.max(door.offset ?? len / 2, 0), len);
      const minCz = z0 + EDGE + half;
      const maxCz = z1 - EDGE - half;
      const cz = Math.min(Math.max(rawCz, minCz), maxCz);
      const topLen = Math.max(cz - half - z0, 0);
      const bottomLen = Math.max(z1 - (cz + half), 0);
      if (topLen > 0.01) {
        const tz = z0 + topLen / 2;
        parts.push(
          <>
            <mesh position={[x, wh / 2, tz]} castShadow>
              <boxGeometry args={[t, wh, topLen]} />
              <meshStandardMaterial color="#cfd7df" />
            </mesh>
            <CuboidCollider args={[t / 2, wh / 2, topLen / 2]} position={[x, wh / 2, tz]} />
          </>
        );
      }
      if (bottomLen > 0.01) {
        const bz = z1 - bottomLen / 2;
        parts.push(
          <>
            <mesh position={[x, wh / 2, bz]} castShadow>
              <boxGeometry args={[t, wh, bottomLen]} />
              <meshStandardMaterial color="#cfd7df" />
            </mesh>
            <CuboidCollider args={[t / 2, wh / 2, bottomLen / 2]} position={[x, wh / 2, bz]} />
          </>
        );
      }
    }
  }

  return <>{parts}</>;
}

function DoorSigns({ room }: { room: Room }) {
  const y = 1.6;
  const t = cfg.wallThickness;
  const x0 = room.x - room.w / 2;
  const x1 = room.x + room.w / 2;
  const z0 = room.z - room.h / 2;
  const z1 = room.z + room.h / 2;
  const doors = room.doors || [];
  if (!doors.length) return null;
  return (
    <>
      {doors.map((d, i) => {
        let sx = room.x, sz = room.z;
        const off = Math.max(0, Math.min(d.offset, d.side === 'N' || d.side === 'S' ? room.w : room.h));
        const OUT = 0.14 + t / 2; // outward offset from wall
        if (d.side === 'N') { sx = x0 + off; sz = z0 - OUT; }
        if (d.side === 'S') { sx = x0 + off; sz = z1 + OUT; }
        if (d.side === 'W') { sx = x0 - OUT; sz = z0 + off; }
        if (d.side === 'E') { sx = x1 + OUT; sz = z0 + off; }
        return (
          <Html key={i} position={[sx, y, sz]} transform occlude>
            <div style={{
              background: 'rgba(0,0,0,0.65)', color: '#fff', padding: '3px 6px', borderRadius: 4,
              fontSize: 11, fontWeight: 700, letterSpacing: 0.3, whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(0,0,0,0.35)'
            }}>
              {room.name}
            </div>
          </Html>
        );
      })}
    </>
  );
}

function FurnitureAll() {
  return (
    <>
      {layout.rooms.map((r) => (
        <RigidBody key={r.key + '_f'} type="fixed" colliders={false}>
          {r.furniture?.map((f, i) => (
            <FurnitureItem key={r.key + '_' + i} room={r} type={f} />
          ))}
        </RigidBody>
      ))}
    </>
  );
}

function FurnitureItem({ room, type }: { room: Room; type: Furniture }) {
  const px = room.x + (type.x || 0);
  const pz = room.z + (type.z || 0);
  const w = type.w || 1;
  const h = type.h || 1;
  const y = type.y || 0.45;

  switch (type.type) {
    case 'bench':
      return (
        <>
          <mesh position={[px, 0.45, pz]} castShadow>
            <boxGeometry args={[w, 0.4, h]} />
            <meshStandardMaterial color="#9fb3c8" />
          </mesh>
          <CuboidCollider args={[w / 2, 0.2, h / 2]} position={[px, 0.45, pz]} />
        </>
      );
    case 'counter':
      return (
        <>
          <mesh position={[px, 1, pz]} castShadow>
            <boxGeometry args={[w, 1.2, h]} />
            <meshStandardMaterial color="#b6c2cf" />
          </mesh>
          <CuboidCollider args={[w / 2, 0.6, h / 2]} position={[px, 0.6, pz]} />
        </>
      );
    case 'kiosk':
      return (
        <>
          <mesh position={[px, 0.8, pz]} castShadow>
            <boxGeometry args={[w, 1.0, h]} />
            <meshStandardMaterial color="#a9b8c7" />
          </mesh>
          <CuboidCollider args={[w / 2, 0.5, h / 2]} position={[px, 0.5, pz]} />
        </>
      );
    case 'shelf':
    case 'cabinet':
      return (
        <>
          <mesh position={[px, 1.1, pz]} castShadow>
            <boxGeometry args={[w, 1.8, h]} />
            <meshStandardMaterial color="#aab7c4" />
          </mesh>
          <CuboidCollider args={[w / 2, 0.9, h / 2]} position={[px, 0.9, pz]} />
        </>
      );
    case 'table':
      return (
        <>
          <mesh position={[px, 0.78, pz]} castShadow>
            <boxGeometry args={[w, 0.06, h]} />
            <meshStandardMaterial color="#d0d7de" />
          </mesh>
          {/* legs simplified as single collider */}
          <CuboidCollider args={[w / 2, 0.8, h / 2]} position={[px, 0.4, pz]} />
        </>
      );
    case 'bed':
      return (
        <>
          <mesh position={[px, 0.6, pz]} castShadow>
            <boxGeometry args={[w, 0.5, h]} />
            <meshStandardMaterial color="#dfe7ee" />
          </mesh>
          <CuboidCollider args={[w / 2, 0.25, h / 2]} position={[px, 0.25, pz]} />
        </>
      );
    case 'partition':
      return (
        <>
          <mesh position={[px, 1.0, pz]} castShadow>
            <boxGeometry args={[w, 2.0, 0.08]} />
            <meshStandardMaterial color="#c7d0d9" />
          </mesh>
          <CuboidCollider args={[w / 2, 1.0, 0.04]} position={[px, 1.0, pz]} />
        </>
      );
    case 'carpet':
      return (
        <mesh position={[px, 0.011, pz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial color="#e9eef2" />
        </mesh>
      );
    case 'sign':
      return (
        <Html position={[px, 1.7, pz]} center>
          <div style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, padding: '2px 6px', borderRadius: 4 }}>
            {type.label || 'Signage'}
          </div>
        </Html>
      );
    default:
      return (
        <>
          <mesh position={[px, 0.6, pz]} castShadow>
            <boxGeometry args={[w, 1.2, h]} />
            <meshStandardMaterial color="#ff6b6b" />
          </mesh>
          <CuboidCollider args={[w / 2, 0.6, h / 2]} position={[px, 0.6, pz]} />
        </>
      );
  }
}

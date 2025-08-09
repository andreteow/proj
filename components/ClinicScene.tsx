"use client";

import { Html } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { useEffect, useState } from 'react';
import type { Door, Furniture, Room } from '@/lib/types';
import { Player } from '@/components/Player';
import { usePlayerStore } from '@/components/playerStore';
import { NPCs } from '@/components/NPCs';
import { layout, cfg } from '@/components/sharedLayout';

// Capture original slots for randomization (consults, reg/pharm, east wing)
const CONSULT_SLOTS = (() => {
  const consults = layout.rooms.filter(r => r.key?.startsWith('consult'));
  return consults.map((r) => ({
    x: r.x, z: r.z, w: r.w, h: r.h,
    doors: (r.doors || []).map(d => ({ side: d.side, offset: d.offset, width: d.width }))
  }));
})();

const REG_PHARM_SLOTS = (() => {
  const keys = new Set(['registration','pharmacy']);
  const rooms = layout.rooms.filter(r => r.key && keys.has(r.key));
  return rooms.map((r) => ({ x: r.x, z: r.z, w: r.w, h: r.h, doors: (r.doors || []).map(d => ({ ...d })) }));
})();

const EAST_SLOTS = (() => {
  const keys = new Set(['lab','immun','mch']);
  const rooms = layout.rooms.filter(r => r.key && keys.has(r.key));
  return rooms.map((r) => ({ x: r.x, z: r.z, w: r.w, h: r.h, doors: (r.doors || []).map(d => ({ ...d })) }));
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

function randomizeConsultRooms(seed: number) {
  const consults = layout.rooms.filter(r => r.key?.startsWith('consult'));
  if (consults.length !== CONSULT_SLOTS.length) return;
  const rnd = seededRand(seed || 1);
  const idx = [...CONSULT_SLOTS.keys()];
  // Fisher–Yates shuffle
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  consults.forEach((r, i) => {
    const s = CONSULT_SLOTS[idx[i]];
    r.x = s.x; r.z = s.z; r.w = s.w; r.h = s.h; r.doors = s.doors.map(d => ({ ...d }));
  });
}

function randomizeRoomsGroup(keys: string[], slots: { x: number; z: number; w: number; h: number; doors: Door[] }[], seed: number) {
  const set = new Set(keys);
  const rooms = layout.rooms.filter(r => r.key && set.has(r.key));
  if (rooms.length !== slots.length) return;
  const rnd = seededRand(seed || 1);
  const idx = [...slots.keys()];
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  rooms.forEach((r, i) => {
    const s = slots[idx[i]];
    r.x = s.x; r.z = s.z; r.w = s.w; r.h = s.h; r.doors = s.doors.map(d => ({ ...d }));
  });
}

export function ClinicScene() {
  const resetToken = usePlayerStore((s) => s.resetToken);
  const [randVersion, setRandVersion] = useState(0);
  useEffect(() => {
    // Randomize layout on each new game (deterministic per reset burst)
    const baseSeed = (resetToken + (Date.now() % 1000)) | 0;
    randomizeConsultRooms(baseSeed ^ 0x1a2b3c);
    randomizeRoomsGroup(['registration','pharmacy'], REG_PHARM_SLOTS, baseSeed ^ 0x55aa);
    randomizeRoomsGroup(['lab','immun','mch'], EAST_SLOTS, baseSeed ^ 0xdeadbe);
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
      const cx = x0 + Math.min(Math.max(door.offset, 0), len);
      const half = Math.max(door.width / 2, 0.4);
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
      const cz = z0 + Math.min(Math.max(door.offset, 0), len);
      const half = Math.max(door.width / 2, 0.4);
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

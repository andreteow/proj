"use client";

import { Html } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { useMemo } from 'react';
import layoutData from '@/data/kk-titiwangsa';
import { sanitizeLayout, aabbContains } from '@/lib/layout';
import type { Door, Furniture, Room } from '@/lib/types';
import { Player } from '@/components/Player';

const { layout, cfg } = sanitizeLayout(layoutData);

export function ClinicScene() {
  return (
    <>
      <hemisphereLight intensity={0.85} groundColor={0xcad9e6} color={0xf5f7fb} />
      <directionalLight position={[14, 16, 10]} castShadow intensity={0.65} color={0xffffff} />
      <Physics debug={false} gravity={[0, -9.81, 0]}>
        <WorldBounds />
        <Corridors />
        <Rooms />
        <FurnitureAll />
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

      {/* Label */}
      <RoomLabel room={room} />
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

function RoomLabel({ room }: { room: Room }) {
  const y = Math.max(1.65, cfg.wallHeight * 0.55);
  const content = useMemo(() => room.name || 'Tanpa Nama', [room.name]);
  return (
    <Html position={[room.x, y, room.z]} center style={{ pointerEvents: 'none' }}>
      <div style={{
        background: 'rgba(0,0,0,0.55)', color: '#fff', padding: '2px 6px', borderRadius: 4,
        fontSize: 12, fontWeight: 600, letterSpacing: 0.3
      }}>
        {content}
      </div>
    </Html>
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

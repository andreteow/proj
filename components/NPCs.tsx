"use client";

import type { Layout } from '@/lib/types';
import { useProgressStore } from '@/components/progressStore';

function BlockyPerson({ position, color = '#8cc0ff' }: { position: [number, number, number]; color?: string }) {
  const [x, y, z] = position;
  return (
    <group position={[x, y, z]}>
      {/* body */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.6, 1.2, 0.4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* head */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <boxGeometry args={[0.45, 0.45, 0.45]} />
        <meshStandardMaterial color="#ffe1bd" />
      </mesh>
    </group>
  );
}

export function NPCs({ layout }: { layout: Layout }) {
  const progress = useProgressStore();
  const list: { x: number; z: number; color: string }[] = [];

  // Active checkpoint logic
  if (!progress.checkedIn) {
    const reg = layout.rooms.find((r) => r.key === 'registration');
    if (reg) list.push({ x: reg.x + 0.5, z: reg.z + 1.6, color: '#7db4ff' });
  } else if (!progress.consulted) {
    const target = progress.targetConsult;
    if (target != null) {
      const room = layout.rooms.find((r) => r.key === `consult${target}`);
      if (room) list.push({ x: room.x + 0.2, z: room.z + 0.2, color: '#ff3c64' }); // highlight active doctor
    }
  } else if (!progress.gotMeds) {
    const pharm = layout.rooms.find((r) => r.key === 'pharmacy');
    if (pharm) list.push({ x: pharm.x + 0.5, z: pharm.z + 1.6, color: '#1ad98a' });
  } else {
    // After completion: optional ambient staff
    const reg = layout.rooms.find((r) => r.key === 'registration');
    if (reg) list.push({ x: reg.x + 0.5, z: reg.z + 1.6, color: '#7db4ff' });
    const pharm = layout.rooms.find((r) => r.key === 'pharmacy');
    if (pharm) list.push({ x: pharm.x + 0.5, z: pharm.z + 1.6, color: '#7de0a6' });
  }

  return (
    <>
      {list.map((p, i) => (
        <BlockyPerson key={i} position={[p.x, 0, p.z]} color={p.color} />
      ))}
    </>
  );
}

export default NPCs;

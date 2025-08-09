"use client";

import type { Layout } from '@/lib/types';

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
  const list: { x: number; z: number; color: string }[] = [];
  const reg = layout.rooms.find((r) => r.key === 'registration');
  if (reg) list.push({ x: reg.x + 0.5, z: reg.z + 1.6, color: '#7db4ff' });
  const pharm = layout.rooms.find((r) => r.key === 'pharmacy');
  if (pharm) list.push({ x: pharm.x + 0.5, z: pharm.z + 1.6, color: '#7de0a6' });
  const consults = layout.rooms.filter((r) => r.key?.startsWith('consult'));
  consults.forEach((r) => list.push({ x: r.x + 0.2, z: r.z + 0.2, color: '#ffb3bf' }));

  return (
    <>
      {list.map((p, i) => (
        <BlockyPerson key={i} position={[p.x, 0, p.z]} color={p.color} />
      ))}
    </>
  );
}

export default NPCs;

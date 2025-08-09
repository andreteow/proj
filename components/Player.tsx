"use client";

import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { usePlayerStore } from '@/components/playerStore';
import layoutData from '@/data/kk-titiwangsa';
import { sanitizeLayout, aabbContains } from '@/lib/layout';
import { useProgressStore } from '@/components/progressStore';

const { layout } = sanitizeLayout(layoutData);

function useKeyboard() {
  const keys = useMemo(() => new Set<string>(), []);
  const pressed = useRef(keys);
  // Attach once
  useEffect(() => {
    const down = (e: KeyboardEvent) => pressed.current.add(e.key.toLowerCase());
    const up = (e: KeyboardEvent) => pressed.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);
  return pressed;
}

export function Player() {
  const body = useRef<any>(null);
  const camera = useThree((s) => s.camera);
  const pressed = useKeyboard();
  const setPlayer = usePlayerStore((s) => s.set);
  const progress = useProgressStore();

  const speedBase = 3.0; // m/s
  const speedRun = 5.2;
  const headHeight = 1.6;

  useFrame((_, dt) => {
    const rb = body.current;
    if (!rb) return;

    // Orientation from camera (PointerLockControls updates camera.quaternion)
    const dirForward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    dirForward.y = 0; dirForward.normalize();
    const dirRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    dirRight.y = 0; dirRight.normalize();

    // Input mapping
    const k = pressed.current;
    let move = new THREE.Vector3();
    if (k.has('w')) move.add(dirForward);
    if (k.has('s')) move.add(dirForward.clone().multiplyScalar(-1));
    if (k.has('a')) move.add(dirRight.clone().multiplyScalar(-1));
    if (k.has('d')) move.add(dirRight);
    const running = k.has('shift');
    const speed = running ? speedRun : speedBase;

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(speed);
    }

    // Preserve vertical velocity, set horizontal
    const v = rb.linvel();
    rb.setLinvel({ x: move.x, y: v.y, z: move.z }, true);

    // Keep camera coupled to player position
    const t = rb.translation();
    camera.position.set(t.x, headHeight, t.z);

    // Update global store for minimap
    setPlayer(t.x, t.z);

    // Simple objective progression by room entry
    // 1) Registration -> checkedIn
    // 2) Any consult room -> consulted
    // 3) Pharmacy -> gotMeds
    if (!progress.checkedIn) {
      const reg = layout.rooms.find(r => r.key === 'registration');
      if (reg && aabbContains(t.x, t.z, reg.x, reg.z, reg.w, reg.h)) progress.setCheckedIn();
    }
    if (!progress.consulted) {
      const inConsult = layout.rooms.some(r => r.key?.startsWith('consult') && aabbContains(t.x, t.z, r.x, r.z, r.w, r.h));
      if (inConsult) progress.setConsulted();
    }
    if (!progress.gotMeds) {
      const pharm = layout.rooms.find(r => r.key === 'pharmacy');
      if (pharm && aabbContains(t.x, t.z, pharm.x, pharm.z, pharm.w, pharm.h) && progress.consulted) progress.setGotMeds();
    }
  });

  return (
    <>
      <PointerLockControls />
      <RigidBody
        ref={body}
        colliders={false}
        gravityScale={1}
        linearDamping={0.4}
        angularDamping={0.9}
        mass={80}
        enabledRotations={[false, true, false]} // allow yaw only
        position={[0, headHeight, 6]}
      >
        <CapsuleCollider args={[0.6, 0.35]} position={[0, -0.6, 0]} />
        {/* Tiny helper: invisible head anchor (camera uses rigidbody position above) */}
        <mesh position={[0, -headHeight, 0]} visible={false}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial color="hotpink" />
        </mesh>
      </RigidBody>
    </>
  );
}

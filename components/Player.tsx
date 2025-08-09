"use client";

import { useThree, useFrame } from '@react-three/fiber';
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
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'arrowright') e.preventDefault();
      pressed.current.add(k);
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'arrowright') e.preventDefault();
      pressed.current.delete(k);
    };
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
  const yaw = usePlayerStore((s) => s.yaw);
  const setYaw = usePlayerStore((s) => s.setYaw);
  const resetToken = usePlayerStore((s) => s.resetToken);
  const spawnX = usePlayerStore((s) => s.spawnX);
  const spawnZ = usePlayerStore((s) => s.spawnZ);
  const setHint = usePlayerStore((s) => s.setHint);
  const progress = useProgressStore();

  const speedBase = 3.0; // m/s
  const speedRun = 5.2;
  const headHeight = 1.6;
  const yawSpeed = 1.8; // rad/s

  const prevE = useRef(false);

  // On reset request, teleport to spawn and zero velocity
  useEffect(() => {
    const rb = body.current;
    if (!rb) return;
    rb.setTranslation({ x: spawnX, y: headHeight, z: spawnZ }, true);
    rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
    setPlayer(spawnX, spawnZ);
    setYaw(0);
    camera.position.set(spawnX, headHeight, spawnZ);
    camera.rotation.set(0, 0, 0);
    setHint(null);
  }, [resetToken]);

  useFrame((_, dt) => {
    const rb = body.current;
    if (!rb) return;
    // Update yaw from arrow keys (no pitch)
    const k = pressed.current;
    let newYaw = yaw;
    if (k.has('arrowleft')) newYaw += yawSpeed * dt;
    if (k.has('arrowright')) newYaw -= yawSpeed * dt;
    if (newYaw !== yaw) setYaw(newYaw);

    // Derive forward/right vectors from yaw
    const sin = Math.sin(newYaw); const cos = Math.cos(newYaw);
    const dirForward = new THREE.Vector3(-sin, 0, -cos);
    const dirRight = new THREE.Vector3(cos, 0, -sin);

    // Input mapping
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

    // Keep camera coupled to player position and orientation (no pitch)
    const t = rb.translation();
    camera.position.set(t.x, headHeight, t.z);
    camera.rotation.set(0, newYaw, 0);

    // Update global store for minimap
    setPlayer(t.x, t.z);

    // Interaction zones and hints (E to interact)
    // Helper: show hint and process one-shot E press
    const justPressedE = k.has('e') && !prevE.current; // on keydown edge
    prevE.current = k.has('e');

    // Default no hint
    let hint: string | null = null;

    // Registration interaction: near registration counter
    if (!progress.checkedIn) {
      const reg = layout.rooms.find(r => r.key === 'registration');
      if (reg && aabbContains(t.x, t.z, reg.x, reg.z, reg.w, reg.h)) {
        // Find a counter furniture inside registration
        const counter = reg.furniture?.find(f => f.type === 'counter');
        const cx = (counter ? reg.x + (counter.x || 0) : reg.x);
        const cz = (counter ? reg.z + (counter.z || 0) : reg.z);
        const dist2 = (t.x - cx) ** 2 + (t.z - cz) ** 2;
        if (dist2 < 4) { // within 2m
          hint = 'Tekan E untuk Daftar';
          if (justPressedE) {
            progress.setCheckedIn();
            if (!progress.running) progress.start();
          }
        }
      }
    }

    // Consult interaction: inside any consult room
    if (!progress.consulted && !hint) {
      const room = layout.rooms.find(r => r.key?.startsWith('consult') && aabbContains(t.x, t.z, r.x, r.z, r.w, r.h));
      if (room) {
        hint = 'Tekan E untuk Jumpa Doktor';
        if (justPressedE) {
          progress.setConsulted();
        }
      }
    }

    // Pharmacy interaction: near pharmacy counter, after consulted
    if (!progress.gotMeds && progress.consulted && !hint) {
      const pharm = layout.rooms.find(r => r.key === 'pharmacy');
      if (pharm && aabbContains(t.x, t.z, pharm.x, pharm.z, pharm.w, pharm.h)) {
        const counter = pharm.furniture?.find(f => f.type === 'counter');
        const cx = (counter ? pharm.x + (counter.x || 0) : pharm.x);
        const cz = (counter ? pharm.z + (counter.z || 0) : pharm.z);
        const dist2 = (t.x - cx) ** 2 + (t.z - cz) ** 2;
        if (dist2 < 4) {
          hint = 'Tekan E untuk Ambil Ubat';
          if (justPressedE) {
            progress.setGotMeds();
            // Stop timer upon completion
            if (progress.running) progress.stop();
          }
        }
      }
    }

    setHint(hint);
  });

  return (
    <>
      <RigidBody
        ref={body}
        colliders={false}
        gravityScale={1}
        linearDamping={0.4}
        angularDamping={0.9}
        mass={80}
        enabledRotations={[false, true, false]} // allow yaw only
        ccd
        canSleep={false}
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

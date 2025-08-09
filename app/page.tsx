"use client";

import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import { ClinicScene } from '@/components/ClinicScene';
import { HUD } from '@/components/HUD';
import { MiniMap } from '@/components/MiniMap';

export default function Page() {
  const [showMap, setShowMap] = useState(true);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key.toLowerCase() === 'm') setShowMap(s => !s); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <main style={{ height: '100vh', width: '100vw' }}>
      <Suspense fallback={null}>
        <Canvas shadows camera={{ fov: 70, position: [0, 1.6, 6] }}>
          <ClinicScene />
        </Canvas>
      </Suspense>
      <HUD />
      {showMap && <MiniMap />}
    </main>
  );
}

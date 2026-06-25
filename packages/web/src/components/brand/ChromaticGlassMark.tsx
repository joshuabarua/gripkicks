"use client";

import React, { Suspense, useRef, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, MeshTransmissionMaterial } from "@react-three/drei";
import { Mesh } from "three";
import { useHighPerformanceMode, useAnimationsEnabled } from "@/stores/useAppStore";

useGLTF.preload("/glb/HeroShoe.glb");

function GlassShoe() {
  const { nodes } = useGLTF("/glb/HeroShoe.glb");
  const mesh = useRef<Mesh>(null);
  const highPerformanceMode = useHighPerformanceMode();
  const animationsEnabled = useAnimationsEnabled();

  const shoeNode = nodes["CimbingShoe"] as Mesh | undefined;

  const animateFrame = useCallback((t: number) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = t * 0.4;
    mesh.current.rotation.x = Math.sin(t * 0.4) * 0.08;
  }, []);

  useFrame((state) => {
    if (animationsEnabled && !highPerformanceMode) {
      animateFrame(state.clock.getElapsedTime());
    }
  });

  if (!shoeNode) return null;

  return (
    <group ref={mesh} scale={1.6}>
      <mesh geometry={shoeNode.geometry}>
        <MeshTransmissionMaterial
          thickness={0.2}
          roughness={0.1}
          chromaticAberration={0.08}
          ior={1.2}
          backside
          transmission={1}
          samples={2}
        />
      </mesh>
    </group>
  );
}

type ChromaticGlassMarkProps = {
  size?: number;
  className?: string;
};

export default function ChromaticGlassMark({
  size = 200,
  className = "",
}: ChromaticGlassMarkProps) {
  const highPerformanceMode = useHighPerformanceMode();

  if (highPerformanceMode) return null;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Canvas
        gl={{ antialias: false, alpha: true }}
        dpr={[1, 1.5] as [number, number]}
        camera={{ position: [0, 0, 3.2], fov: 35 }}
        style={{ width: size, height: size }}
      >
        <ambientLight intensity={1} />
        <directionalLight intensity={2} position={[0, 3, 4]} />
        <Suspense fallback={null}>
          <GlassShoe />
        </Suspense>
      </Canvas>
    </div>
  );
}

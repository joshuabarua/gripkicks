"use client";

import React, { Suspense, useRef, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, MeshTransmissionMaterial, Text } from "@react-three/drei";
import { Mesh } from "three";
import { useHighPerformanceMode, useAnimationsEnabled } from "@/stores/useAppStore";

useGLTF.preload("/glb/HeroShoe.glb");

function MiniShoe() {
  const { nodes } = useGLTF("/glb/HeroShoe.glb");
  const mesh = useRef<Mesh>(null);
  const highPerformanceMode = useHighPerformanceMode();
  const animationsEnabled = useAnimationsEnabled();

  const shoeNode = nodes["CimbingShoe"] as Mesh | undefined;

  const animateFrame = useCallback((t: number) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = t * 0.8;
    mesh.current.rotation.x = Math.sin(t * 0.5) * 0.05;
  }, []);

  useFrame((state) => {
    if (animationsEnabled && !highPerformanceMode) {
      animateFrame(state.clock.getElapsedTime());
    }
  });

  if (!shoeNode) return null;

  return (
    <group scale={1.6} position={[0, -0.1, 0]}>
      <Text
        fontSize={0.5}
        position={[0, 0.35, 0]}
        font="fonts/BallPill-regular.otf"
        color="rgb(255, 252, 242)"
        letterSpacing={-0.08}
      >
        GRIP
      </Text>
      <Text
        fontSize={0.5}
        position={[0, 0.05, 0]}
        font="fonts/BallPill-regular.otf"
        color="rgb(255, 252, 242)"
        letterSpacing={-0.08}
      >
        KICKS
      </Text>
      <group ref={mesh}>
        <mesh geometry={shoeNode.geometry} position={[0, -0.3, 0]}>
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
    </group>
  );
}

export default function NavLogo() {
  const highPerformanceMode = useHighPerformanceMode();

  if (highPerformanceMode) {
    return (
      <span className="font-ball-pill text-fluid-2xl whitespace-nowrap">
        GripKicks
      </span>
    );
  }

  return (
    <div className="w-14 h-14 relative">
      <Canvas
        gl={{ antialias: false, alpha: true }}
        dpr={[1, 1.5] as [number, number]}
        camera={{ position: [0, 0, 3.2], fov: 35 }}
        style={{ width: 56, height: 56 }}
      >
        <ambientLight intensity={1} />
        <directionalLight intensity={2} position={[0, 3, 4]} />
        <Suspense fallback={null}>
          <MiniShoe />
        </Suspense>
      </Canvas>
    </div>
  );
}

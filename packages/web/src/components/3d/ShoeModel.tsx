import React, { useRef, useCallback, useMemo } from "react";
import { useGLTF, MeshTransmissionMaterial } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Mesh } from "three";
import { useHighPerformanceMode, useAnimationsEnabled } from "@/stores/useAppStore";
import CanvasTextPlane from "./CanvasTextPlane";

// Preload the model for better performance
useGLTF.preload("/glb/HeroShoe.glb");

function ShoeLabels() {
  return (
    <>
      <CanvasTextPlane text="GRIP" position={[0.01, 0.45, 0]} height={0.7} />
      <CanvasTextPlane text="KICKS" position={[0, -0.2, 0]} height={0.7} />
    </>
  );
}

export default function ShoeModel() {
  const { nodes } = useGLTF("/glb/HeroShoe.glb");
  const { viewport } = useThree();
  const responsiveScale = useMemo(
    () => Math.min(Math.max(viewport.width / 3.5, 1), 2.4),
    [viewport.width],
  );

  // Get performance settings from store
  const highPerformanceMode = useHighPerformanceMode();
  const animationsEnabled = useAnimationsEnabled();

  // Adaptive material settings based on device performance and user preferences
  const materialSettings = useMemo(() => {
    return {
      color: "rgb(255, 252, 242)",
      attenuationColor: "rgb(244, 91, 91)",
      attenuationDistance: 0.5,
      thickness: 0.2,
      roughness: 0.1,
      chromaticAberration: 0.08,
      ior: 1.2,
      backside: true,
      transmission: 1,
      samples: 2,
    };
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mesh = useRef<any>({});
  const shoeNode = nodes["CimbingShoe"] as Mesh | undefined;

  // Reduce or disable animations based on settings
  const animateFrame = useCallback((t: number) => {
    if (!mesh.current || !animationsEnabled || highPerformanceMode) return;
    if (mesh.current.position && mesh.current.rotation) {
      const speed = 1;
      const amplitude = 0.1;

      mesh.current.position.y = (Math.sin(t / (0.8 / speed))) * amplitude;
      mesh.current.position.z = 0.2 + (Math.sin(t / (2.5 / speed))) * 0.025;
      mesh.current.rotation.y = (t / 2) * speed;
      mesh.current.rotation.z = 0.3 + Math.sin(t / (4.5 / speed)) * 0.1;
    }
  }, [animationsEnabled, highPerformanceMode]);

  useFrame((state) => {
    if (animationsEnabled && !highPerformanceMode) {
      animateFrame(state.clock.getElapsedTime());
    }
  });

  return (
    <group dispose={null} scale={responsiveScale}>
        <ShoeLabels />

        <group
          ref={mesh}
        >
          {!shoeNode ? null : (
            <mesh
              {...shoeNode}
              position={[0, -0.4, 0]}
              geometry={shoeNode.geometry}
            >
              <MeshTransmissionMaterial {...materialSettings} />
            </mesh>
          )}
        </group>
      </group>
  );
}

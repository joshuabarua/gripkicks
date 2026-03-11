import React, { useRef, useCallback, Suspense, useMemo } from "react";
import { useGLTF, Text, MeshTransmissionMaterial } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Mesh } from "three";
import { useHighPerformanceMode, useAnimationsEnabled } from "@/stores/useAppStore";

// Preload the model for better performance
useGLTF.preload("/glb/HeroShoe.glb");

// Detect if user is on mobile/device with limited GPU
const isLowPerformanceDevice = () => {
  if (typeof window === 'undefined') return false;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    navigator.hardwareConcurrency < 4 ||
    ((navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8) < 4
  );
};

export default function ShoeModel() {
  const { nodes } = useGLTF("/glb/HeroShoe.glb");
  const { viewport } = useThree();

  // Get performance settings from store
  const highPerformanceMode = useHighPerformanceMode();
  const animationsEnabled = useAnimationsEnabled();

  // Adaptive material settings based on device performance and user preferences
  const materialSettings = useMemo(() => {
    return {
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

  // Reduce or disable animations based on settings
  const animateFrame = useCallback((t: number) => {
    if (!mesh.current || !animationsEnabled || highPerformanceMode) return;
    if (mesh.current.position && mesh.current.rotation) {
      const isLowPerf = isLowPerformanceDevice() || highPerformanceMode;
      const speed = isLowPerf ? 0.25 : 1;
      const amplitude = isLowPerf ? 0.025 : 0.1;

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
    <Suspense fallback={null}>
      <group dispose={null} scale={viewport.width / 3.5}>
        <Text
          fontSize={0.8}
          position={[0.01, .5, 0]}
          font="fonts/Tanker-Regular.ttf"
          color="rgb(255, 252, 242)"
        >
          Grip
        </Text>

        <Text
          fontSize={0.8}
          position={[0, -.2, 0]}
          font="fonts/Tanker-Regular.ttf"
          color="rgb(255, 252, 242)"
        >
          Kicks
        </Text>

        <group ref={mesh}>
          <mesh
            {...nodes.CimbingShoe}
            position={[0, -0.4, 0]}
            geometry={(nodes.CimbingShoe as Mesh).geometry}
          >
            <MeshTransmissionMaterial {...materialSettings} />
          </mesh>
        </group>
      </group >
    </Suspense>
  );
}

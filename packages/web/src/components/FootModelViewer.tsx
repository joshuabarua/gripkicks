"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import { useState, useEffect, useRef, Suspense } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

const useThrottle = <T,>(value: T, delay: number): T => {
  const [throttledValue, setThrottledValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setThrottledValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return throttledValue;
};

function FootModel({
  modelPath = "/glb/foot.glb",
  shape = "medium",
  volume = "medium",
  scale = 1,
}: {
  modelPath?: string;
  shape?: string;
  volume?: string;
  scale?: number;
}) {
  const { camera } = useThree();
  const gltf = useGLTF(modelPath);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Throttled values for performance
  const throttledShape = useThrottle(shape, 100);
  const throttledVolume = useThrottle(volume, 100);

  // Auto-center and setup camera
  useEffect(() => {
    if (!gltf.scene) return;

    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Center the model
    gltf.scene.position.x = -center.x;
    gltf.scene.position.y = -center.y;
    gltf.scene.position.z = -center.z;

    // Auto-adjust camera distance
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 2;

    camera.position.set(0, 0, cameraZ);
    camera.lookAt(0, 0, 0);

    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [gltf.scene, camera]);

  // Apply morph targets
  useEffect(() => {
    if (!gltf.scene) return;

    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.morphTargetInfluences) {
        meshRef.current = child;

        // Reset all morphs
        child.morphTargetInfluences.fill(0);

        // Apply shape morphs based on available morph targets
        if (child.morphTargetDictionary) {
          const morphNames = Object.keys(child.morphTargetDictionary);

          // Try to find and apply shape morphs
          if (throttledShape !== "medium") {
            const shapeMorph = morphNames.find((name) =>
              name.toLowerCase().includes(throttledShape.toLowerCase()),
            );
            if (shapeMorph) {
              const index = child.morphTargetDictionary[shapeMorph];
              if (index === undefined) return;
              child.morphTargetInfluences[index] = 1.0;
            }
          }

          // Try to find and apply volume morphs
          if (throttledVolume !== "medium") {
            const volumeMorph = morphNames.find(
              (name) =>
                name.toLowerCase().includes(throttledVolume.toLowerCase()) ||
                name.toLowerCase().includes("volume"),
            );
            if (volumeMorph) {
              const index = child.morphTargetDictionary[volumeMorph];
              if (index === undefined) return;
              child.morphTargetInfluences[index] = 1.0;
            }
          }
        }

        // Fallback to hardcoded indices if no dictionary exists
        if (!child.morphTargetDictionary && child.morphTargetInfluences.length > 0) {
          // You'll need to adjust these based on your actual GLB morph target order
          if (child.morphTargetInfluences[0] !== undefined) {
            child.morphTargetInfluences[0] =
              throttledShape === "egyptian" ? 1 : 0;
          }
          if (child.morphTargetInfluences[1] !== undefined) {
            child.morphTargetInfluences[1] = throttledVolume === "high" ? 1 : 0;
          }
        }
      }
    });
  }, [gltf.scene, throttledShape, throttledVolume]);


  return (
    <>
      <primitive object={gltf.scene} scale={scale} />
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={false}
        target={[0, 0, 0]}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  );
}

interface FootModelViewerProps {
  modelPath?: string;
  containerClassName?: string;
}

function Loader() {
  return (
    <Html center>
      <div className="w-4 h-4 rounded-full bg-white/30 animate-pulse" />
    </Html>
  );
}

export default function FootModelViewer({
  modelPath = "/glb/foot.optimized.glb",
  containerClassName,
}: FootModelViewerProps) {
  return (
    <div className={containerClassName ?? "w-full h-full bg-slate-950 relative"}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: "rgb(15 23 42)" }}
        className="absolute inset-0"
      >
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} />
        <Suspense fallback={<Loader />}>
          <FootModel modelPath={modelPath} />
        </Suspense>
      </Canvas>
    </div>
  );
}

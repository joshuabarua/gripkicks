import React, { useRef, Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Object3D, Mesh } from "three";

interface CardModelProps {
  modelPath: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  animate?: boolean;
  bobIntensity?: number;
  rotationSpeed?: number;
  hoverScale?: number;
}

export default function CardModel({
  modelPath,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  animate = true,
  bobIntensity = 0.1,
  rotationSpeed = 0.5,
}: CardModelProps) {
  const { nodes } = useGLTF(modelPath);
  const mesh = useRef<Object3D>(null);

  useFrame((state) => {
    if (!mesh.current || !animate) return;
    
    const time = state.clock.getElapsedTime();
    
    // Bobbing motion
    if (mesh.current.position) {
      mesh.current.position.y = position[1] + Math.sin(time * 2) * bobIntensity;
    }
    
    // Rotation
    if (mesh.current.rotation) {
      mesh.current.rotation.y = rotation[1] + time * rotationSpeed;
    }
  });

  return (
    <Suspense fallback={null}>
      <group scale={scale} position={position} rotation={rotation}>
        <group ref={mesh}>
          {/* Try to find the main mesh in the loaded model */}
          {Object.values(nodes).map((node, index) => {
            const meshNode = node as Mesh;
            if (meshNode.type === 'Mesh') {
              return (
                <mesh
                  key={index}
                  geometry={meshNode.geometry}
                  position={meshNode.position}
                  rotation={meshNode.rotation}
                  scale={meshNode.scale}
                >
                  {meshNode.material ? (
                    <primitive object={meshNode.material} attach="material" />
                  ) : (
                    <meshStandardMaterial color="#ffffff" />
                  )}
                </mesh>
              );
            }
            return null;
          })}
        </group>
      </group>
    </Suspense>
  );
}

import React, { useRef, useCallback, Suspense } from "react";
import { useGLTF, Text, MeshTransmissionMaterial } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Mesh } from "three";

export default function ShoeModel() {
  const { nodes } = useGLTF("/HeroShoe.glb");
  const { viewport } = useThree();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mesh = useRef<any>({});
  const animateFrame = useCallback((t: number) => {
    if (!mesh.current) return;
    if (mesh.current.position && mesh.current.rotation) {
      mesh.current.position.y = (Math.sin(t / .8)) / 10;
      mesh.current.position.z = 0.2 + (Math.sin(t / 2.5)) / 8;
      mesh.current.rotation.y = t / 2;
      mesh.current.rotation.z = 0.3 + Math.sin(t / 4.5) / 2.5;
    }
  }, []);

  useFrame((state) => {
    animateFrame(state.clock.getElapsedTime());
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

        <Text
          fontSize={0.1}
          position={[0, -.8, 0]}
          font="fonts/Sora.ttf"
          color="rgb(255, 252, 242)"
          textAlign="center"
        >
          No fuss, community based climbing shoe finder
        </Text>

        <group ref={mesh}>
          <mesh 
            {...nodes.CimbingShoe} 
            position={[0, -0.4, 0]}
            // Ensure position attribute is bound to location 0 (fix for macOS)
            geometry={(nodes.CimbingShoe as Mesh).geometry}
          >
            <MeshTransmissionMaterial 
              thickness={.15} 
              roughness={.15} 
              chromaticAberration={0.08} 
              ior={1.2} 
              backside={true} 
              transmission={1} 
            />
          </mesh>
        </group>
      </group >
    </Suspense>
  );
}

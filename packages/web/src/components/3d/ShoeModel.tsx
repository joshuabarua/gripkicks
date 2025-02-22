import React, { useRef } from "react";
import { useGLTF, Text, MeshTransmissionMaterial } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
// import { useControls } from "leva";

export default function ShoeModel() {
  const { nodes } = useGLTF("/shoe.glb");
  const { viewport } = useThree();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mesh = useRef<any>({});

  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.015;
      // mesh.current.rotation.x += 0.003;

    }
  });

  // const materialProps = useControls({
  //   thickness: { value: 0.2, min: 0, max: 3, step: 0.05 },
  //   roughness: { value: 0.2, min: 0, max: 1, step: 0.1 },
  //   transmissions: { value: 1, min: 0, max: 1, step: 0.1 },
  //   ior: { value: 1.2, min: 0, max: 3, step: 0.1 },
  //   chromaticAberration: { value: 0.02, min: 0, max: 1 },
  //   backside: { value: true },
  // });


  return (
    <group dispose={null} scale={viewport.width / 3.5}>
      <Text fontSize={0.6} position={[0.01, 0.6, -0.0]} font="fonts/Basteleur-Bold.otf">
        Grip
      </Text>
      <Text fontSize={0.6} position={[0, -0.0, -0.0]} font="fonts/Basteleur-Bold.otf">
        Kicks
      </Text>
      <group ref={mesh} rotation={[Math.PI / 5, 0, 0]} position={[0, -.2, 0]}>
        <mesh  {...nodes.CimbingShoe} position={[0, 0, 0]}
        >
          <MeshTransmissionMaterial thickness={.2} roughness={.2} chromaticAberration={0.1} ior={1.2} backside={true} transmission={1} />
        </mesh>
      </group>
    </group >
  );
}

useGLTF.preload("/shoe.glb");

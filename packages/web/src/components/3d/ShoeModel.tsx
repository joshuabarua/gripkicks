import React, { useRef, useCallback } from "react";
import { useGLTF, Text, MeshTransmissionMaterial } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useSpring, animated, config } from "@react-spring/three";

export default function ShoeModel() {
  const { nodes } = useGLTF("/shoe.glb");
  const { viewport } = useThree();

  const [gripSpring] = useSpring(() => ({
    from: { y: 0.32, opacity: 0 },
    to: { y: 0.62, opacity: 1 },
    delay: 500,
    config: {
      mass: 1,
      tension: 280,
      friction: 120
    }
  }));

  const [kicksSpring] = useSpring(() => ({
    from: { y: -0.3, opacity: 0 },
    to: { y: 0, opacity: 1 },
    delay: 800,
    config: {
      mass: 1,
      tension: 280,
      friction: 120
    }
  }));

  const [taglineSpring] = useSpring(() => ({
    from: { y: -1.1, opacity: 0 },
    to: { y: -0.8, opacity: 1 },
    delay: 1400,
    config: {
      mass: 1,
      tension: 280,
      friction: 120
    }
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mesh = useRef<any>({});

  const animateFrame = useCallback((t: number) => {
    if (!mesh.current) return;

    mesh.current.position.y = (Math.sin(t / .8)) / 10;

    mesh.current.position.z = 1.7 + (Math.sin(t / 2.5)) / 4;

    mesh.current.rotation.y = t / 2;

    mesh.current.rotation.z = 0.3 + Math.sin(t / 4.5) / 2.5;
  }, []);

  useFrame((state) => {
    animateFrame(state.clock.getElapsedTime());
  });

  return (
    <group dispose={null} scale={viewport.width / 3.5}>
      <animated.group position-y={gripSpring.y}>
        <Text
          fontSize={0.8}
          position={[0.01, 0, 0]}
          font="fonts/Sora.ttf"
          color="rgb(255, 252, 242)"
        >
          Grip
        </Text>
      </animated.group>

      <animated.group position-y={kicksSpring.y}>
        <Text
          fontSize={0.8}
          position={[0, 0, 0]}
          font="fonts/Sora.ttf"
          color="rgb(255, 252, 242)"
        >
          Kicks
        </Text>
      </animated.group>

      <animated.group position-y={taglineSpring.y}>
        <Text
          fontSize={0.1}
          position={[0, 0, 0]}
          font="fonts/Sora.ttf"
          color="rgb(255, 252, 242)"
          textAlign="center"
        >
          No fuss, community based climbing shoe finder
        </Text>
      </animated.group>

      <group ref={mesh}>
        <mesh {...nodes.CimbingShoe} position={[0, -0.5, 0]}>
          <MeshTransmissionMaterial thickness={.15} roughness={.15} chromaticAberration={0.08} ior={1.2} backside={true} transmission={1} />
        </mesh>
      </group>
    </group>
  );
}

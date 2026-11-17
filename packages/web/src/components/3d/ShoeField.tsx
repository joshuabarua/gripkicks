"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, MeshTransmissionMaterial, useGLTF } from "@react-three/drei";
import type { Group, Mesh, PointLight } from "three";
import { useAnimationsEnabled, useHighPerformanceMode } from "@/stores/useAppStore";
import { SHOES_DROP_EVENT, SHOES_RISE_EVENT } from "@/lib/shoe-field";
import { supportsWebGL } from "./webgl-utils";

const MODEL = "/glb/HeroShoe.glb";

interface Pointer {
  x: number;
  y: number;
}

interface ShoeSpec {
  /** Position as a fraction of the half viewport, so the field spreads with the screen. */
  x: number;
  y: number;
  z: number;
  scale: number;
  rotation: [number, number, number];
  spin: number;
}

// Kept to the edges so the form in the middle stays clear.
const SHOES: ShoeSpec[] = [
  { x: -0.82, y: 0.55, z: 0.5, scale: 1.25, rotation: [0.3, 0.6, -0.3], spin: 0.12 },
  { x: 0.85, y: 0.5, z: -1, scale: 1.1, rotation: [-0.2, -0.9, 0.35], spin: -0.1 },
  { x: -0.9, y: -0.55, z: -1.5, scale: 1.2, rotation: [0.5, 2.2, 0.2], spin: 0.08 },
  { x: 0.8, y: -0.6, z: 0.8, scale: 1.35, rotation: [-0.4, -2.4, -0.25], spin: -0.14 },
  { x: -0.55, y: -0.05, z: -3, scale: 1, rotation: [0.1, 1.2, 0.6], spin: 0.1 },
  { x: 0.58, y: 0, z: -3.5, scale: 1, rotation: [0.2, -1.4, -0.5], spin: -0.09 },
  { x: -0.3, y: 0.85, z: -2.5, scale: 0.9, rotation: [-0.5, 0.2, 0.9], spin: 0.07 },
  { x: 0.3, y: -0.9, z: -2, scale: 0.9, rotation: [0.6, 3, -0.8], spin: -0.07 },
  { x: -1.15, y: 0.05, z: -0.5, scale: 1, rotation: [0, -0.6, 1.2], spin: 0.11 },
  { x: 1.2, y: -0.1, z: -2, scale: 1.05, rotation: [-0.3, 0.8, -1.1], spin: -0.12 },
];

interface FieldProps {
  pointer: RefObject<Pointer>;
  dropped: RefObject<boolean>;
  animate: boolean;
}

const GRAVITY = 13;

function Field({ pointer, dropped, animate }: FieldProps) {
  const { nodes } = useGLTF(MODEL);
  const { viewport } = useThree();
  const shoes = useRef<(Group | null)[]>([]);
  const light = useRef<PointLight>(null);
  const eased = useRef<Pointer>({ x: 0, y: 0 });
  const falls = useRef(SHOES.map(() => ({ y: 0, velocity: 0, tumble: 0 })));
  const sinceDrop = useRef(0);

  const geometry = useMemo(() => {
    const source = (nodes["CimbingShoe"] as Mesh | undefined)?.geometry;
    return source ? source.clone().center() : null;
  }, [nodes]);

  useEffect(() => () => geometry?.dispose(), [geometry]);

  useFrame((state, delta) => {
    const target = pointer.current;
    const follow = animate ? 1 - Math.exp(-delta * 4) : 1;
    eased.current.x += (target.x - eased.current.x) * follow;
    eased.current.y += (target.y - eased.current.y) * follow;

    const { x: px, y: py } = eased.current;
    const t = animate ? state.clock.elapsedTime : 0;
    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;
    const step = Math.min(delta, 0.05);
    const falling = animate && dropped.current;
    sinceDrop.current = falling ? sinceDrop.current + step : 0;

    SHOES.forEach((shoe, i) => {
      const group = shoes.current[i];
      const fall = falls.current[i];
      if (!group || !fall) return;

      if (falling) {
        // Staggered release so they don't drop as one rigid sheet.
        if (sinceDrop.current > i * 0.04) {
          fall.velocity -= GRAVITY * step;
          fall.y = Math.max(fall.y + fall.velocity * step, -viewport.height * 3);
          fall.tumble += step * (1.2 + (i % 3) * 0.7) * (i % 2 ? 1 : -1);
        }
      } else {
        fall.velocity = 0;
        fall.y -= fall.y * follow;
        fall.tumble -= fall.tumble * follow;
      }
      // Nearer shoes travel further, which is what sells the depth.
      const depth = Math.min(Math.max((shoe.z + 4) / 5, 0.15), 1);
      group.position.set(
        shoe.x * halfW + px * depth * 0.9,
        shoe.y * halfH + py * depth * 0.6 + Math.sin(t * 0.6 + i) * 0.12 + fall.y,
        shoe.z,
      );
      group.rotation.set(
        shoe.rotation[0] - py * 0.5 + Math.sin(t * 0.4 + i * 1.7) * 0.08 + fall.tumble,
        shoe.rotation[1] + px * 0.9 + t * shoe.spin,
        shoe.rotation[2] + fall.tumble * 0.6,
      );
    });

    light.current?.position.set(px * halfW, py * halfH, 2.5);
  });

  if (!geometry) return null;

  const unit = Math.min(Math.max(viewport.width / 7, 0.55), 1);

  return (
    <>
      <fog attach="fog" args={["#000000", 6, 17]} />
      <Environment preset="city" environmentIntensity={0.2} />
      <ambientLight intensity={0.5} />
      <directionalLight intensity={0.8} position={[0, 3, 4]} />
      <pointLight ref={light} color="#f45b5b" intensity={6} distance={16} decay={2} />
      {SHOES.map((shoe, i) => (
        <group
          key={i}
          ref={(node) => {
            shoes.current[i] = node;
          }}
          scale={shoe.scale * unit}
        >
          <mesh geometry={geometry}>
            {/* Same glass as the home hero, at a lower buffer resolution because
                every shoe renders its own refraction passes. Roughness and chromatic
                aberration are kept near zero: both are sampled with screen-space
                noise, which shimmers as the shoes move. */}
            <MeshTransmissionMaterial
              color="rgb(255, 252, 242)"
              attenuationColor="rgb(244, 91, 91)"
              attenuationDistance={2.5}
              thickness={0.2}
              roughness={0}
              chromaticAberration={0.03}
              ior={1.2}
              transmission={1}
              backside
              samples={6}
              resolution={512}
              backsideResolution={256}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

export default function ShoeField() {
  const pointer = useRef<Pointer>({ x: 0, y: 0 });
  const dropped = useRef(false);
  const animationsEnabled = useAnimationsEnabled();
  const highPerformanceMode = useHighPerformanceMode();
  const [capable] = useState(() => supportsWebGL());
  const [reducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [ready, setReady] = useState(false);
  const animate = animationsEnabled && !highPerformanceMode && !reducedMotion;

  useEffect(() => {
    if (!animate) return;
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [animate]);

  useEffect(() => {
    const drop = () => {
      dropped.current = true;
    };
    const rise = () => {
      dropped.current = false;
    };
    window.addEventListener(SHOES_DROP_EVENT, drop);
    window.addEventListener(SHOES_RISE_EVENT, rise);
    return () => {
      window.removeEventListener(SHOES_DROP_EVENT, drop);
      window.removeEventListener(SHOES_RISE_EVENT, rise);
    };
  }, []);

  if (!capable) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
    >
      {/* Sticky so the field stays in view while a long page scrolls, without
          spilling past the page surface it belongs to. */}
      <div className="sticky top-12 h-[calc(100svh-3rem)]">
        <Canvas
          frameloop={animate ? "always" : "demand"}
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 6], fov: 40 }}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
          style={{ pointerEvents: "none" }}
          onCreated={() => setReady(true)}
        >
          <Suspense fallback={null}>
            <Field pointer={pointer} dropped={dropped} animate={animate} />
          </Suspense>
        </Canvas>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.2)_40%,transparent_65%)]" />
      </div>
    </div>
  );
}

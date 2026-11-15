import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, PanResponder, PixelRatio, View, type StyleProp, type ViewStyle } from 'react-native';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber/native';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { colors } from '@/theme/colors';
import { ETHER_FRAGMENT, ETHER_VERTEX } from './etherShader';

// Mobile port of the web hero (packages/web/src/components/3d/Scene.tsx,
// ShoeModel.tsx, CanvasTextPlane.tsx, EtherField.tsx):
// - the EtherField shader runs as a full-screen layer inside the same scene
// - "GRIP" / "KICKS" are PNGs rendered from the web canvas code (no 2D canvas on native)
// - the glass transmission material is replaced by a glossy physical material
// - drag sideways to spin the shoe; touches also ripple the background

type DragState = { yaw: number; velocity: number; touch: THREE.Vector2; strength: number };

const AMBIENT = new THREE.Color('#171c27');
const ACCENT = new THREE.Color('#ff5a3d');
const STILL_TIME = 12;

function EtherBackground({ still, drag }: { still: boolean; drag: React.MutableRefObject<DragState> }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: ETHER_VERTEX,
        fragmentShader: ETHER_FRAGMENT,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          iResolution: { value: new THREE.Vector2(1, 1) },
          iTime: { value: STILL_TIME },
          uAmbient: { value: new THREE.Vector3(AMBIENT.r, AMBIENT.g, AMBIENT.b) },
          uAccent: { value: new THREE.Vector3(ACCENT.r, ACCENT.g, ACCENT.b) },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uMouseStrength: { value: 0 },
        },
      }),
    [],
  );
  const size = useMemo(() => new THREE.Vector2(), []);
  const smoothed = useRef({ x: 0, y: 0, s: 0 });

  useFrame((state, dt) => {
    state.gl.getDrawingBufferSize(size);
    material.uniforms.iResolution.value.copy(size);
    if (!still) material.uniforms.iTime.value += dt * 0.7;
    // Touch position arrives as 0–1 of the view; the shader wants drawing-buffer pixels.
    const d = drag.current;
    const ease = 1 - Math.pow(0.001, dt);
    const m = smoothed.current;
    m.x += (d.touch.x * size.x - m.x) * ease;
    m.y += ((1 - d.touch.y) * size.y - m.y) * ease;
    m.s += ((still ? 0 : d.strength) - m.s) * ease;
    material.uniforms.uMouse.value.set(m.x, m.y);
    material.uniforms.uMouseStrength.value = m.s;
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

function Wordmark({ source, position }: { source: number; position: [number, number, number] }) {
  // r3f/native resolves bundled asset ids (require(...)) through expo-asset.
  const texture = useLoader(THREE.TextureLoader, source as unknown as string) as THREE.Texture;
  texture.colorSpace = THREE.SRGBColorSpace;
  const height = 0.9;
  return (
    <mesh position={position}>
      <planeGeometry args={[height * (1024 / 320), height]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function Shoe({ still, drag }: { still: boolean; drag: React.MutableRefObject<DragState> }) {
  const gltf = useLoader(GLTFLoader, require('../../../assets/hero/HeroShoeMobile.glb') as string) as unknown as {
    nodes: Record<string, THREE.Object3D>;
  };
  const node = gltf.nodes['CimbingShoe'] as THREE.Mesh | undefined;
  const group = useRef<THREE.Group>(null);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#1c0b0b',
        roughness: 0.16,
        metalness: 0.25,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        sheen: 1,
        sheenColor: new THREE.Color(colors.brand.red),
        emissive: new THREE.Color('#2a0505'),
      }),
    [],
  );

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const d = drag.current;
    // Coast after a fling, then settle back into the idle spin.
    d.yaw += d.velocity * dt;
    d.velocity *= Math.pow(0.04, dt);
    if (still) {
      g.position.set(0, 0, 0.2);
      g.rotation.set(0, 0.6 + d.yaw, -0.2);
      return;
    }
    const t = state.clock.getElapsedTime();
    g.position.y = Math.sin(t / 0.8) * 0.1;
    g.position.z = 0.2 + Math.sin(t / 2.5) * 0.025;
    g.rotation.y = t / 2 + d.yaw;
    g.rotation.z = -0.2 + Math.sin(t / 4.5) * 0.08;
  });

  if (!node) return null;
  return (
    <group ref={group}>
      <mesh geometry={node.geometry} material={material} position={[0, -0.4, 0]} scale={1.45} rotation={node.rotation} />
    </group>
  );
}

function SceneContents({ still, drag, onReady }: { still: boolean; drag: React.MutableRefObject<DragState>; onReady: () => void }) {
  const { viewport } = useThree();
  // Same responsive rule as the web, so the wordmark fills a phone width.
  const scale = Math.min(Math.max(viewport.width / 3.5, 1), 2.4);
  const frames = useRef(0);
  useFrame(() => {
    if (frames.current > 2) return;
    frames.current += 1;
    if (frames.current === 2) onReady();
  });

  return (
    <>
      <directionalLight intensity={2} position={[0, 3, 4]} />
      <ambientLight intensity={1} />
      <pointLight color={ACCENT} intensity={18} distance={12} position={[-3, -1, 2]} />
      <EtherBackground still={still} drag={drag} />
      <group scale={scale}>
        <Wordmark source={require('../../../assets/hero/grip.png')} position={[0.01, 0.3, 0]} />
        <Wordmark source={require('../../../assets/hero/kicks.png')} position={[0, -0.25, 0]} />
        <Shoe still={still} drag={drag} />
      </group>
    </>
  );
}

// Decorative: if WebGL or a model load fails, show the plain canvas instead of crashing Home.
class HeroBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => sub.remove();
  }, []);
  return reduce;
}

export function Hero({ height, style }: { height: number; style?: StyleProp<ViewStyle> }) {
  const still = useReduceMotion();
  const drag = useRef<DragState>({ yaw: 0, velocity: 0, touch: new THREE.Vector2(0.5, 0.5), strength: 0 });
  const width = useRef(1);
  const opacity = useRef(new Animated.Value(0)).current;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, [ready, opacity]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        // Only claim sideways drags so the page still scrolls vertically.
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderGrant: (e) => {
          drag.current.strength = 1;
          drag.current.touch.set(e.nativeEvent.locationX / width.current, e.nativeEvent.locationY / height);
        },
        onPanResponderMove: (e, g) => {
          drag.current.velocity = g.vx * 6;
          drag.current.touch.set(e.nativeEvent.locationX / width.current, e.nativeEvent.locationY / height);
        },
        onPanResponderRelease: () => {
          drag.current.strength = 0;
        },
        onPanResponderTerminate: () => {
          drag.current.strength = 0;
        },
      }),
    [height],
  );

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="GripKicks climbing shoe"
      onLayout={(e) => (width.current = e.nativeEvent.layout.width)}
      style={[{ height, backgroundColor: colors.background, overflow: 'hidden' }, style]}
      {...pan.panHandlers}
    >
      <Animated.View style={{ flex: 1, opacity }}>
        <HeroBoundary>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 75 }}
            style={{ flex: 1 }}
            // Cap at 2x: the raymarched background costs per pixel and 3x screens gain little.
            onCreated={(state) => state.setDpr(Math.min(PixelRatio.get(), 2))}
          >
            <Suspense fallback={null}>
              <SceneContents still={still} drag={drag} onReady={() => setReady(true)} />
            </Suspense>
          </Canvas>
        </HeroBoundary>
      </Animated.View>
    </View>
  );
}

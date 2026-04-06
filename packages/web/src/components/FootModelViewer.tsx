'use client';

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useState, useEffect, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

// Performance optimization: Throttle updates
const useThrottle = <T,>(value: T, delay: number): T => {
  const [throttledValue, setThrottledValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setThrottledValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return throttledValue;
};

// Morph target configuration
const MORPH_CONFIG = {
  // Toe shape morphs (0-1 range)
  egyptian: { bigToe: 1.0, otherToes: 0.3 },
  roman: { bigToe: 0.5, otherToes: 0.5 },
  greek: { bigToe: 0.3, otherToes: 1.0 },
  germanic: { bigToe: 0.7, otherToes: 0.7 },
  celtic: { bigToe: 0.6, otherToes: 0.8 },

  // Volume morphs (0-1 range)
  low: { width: 0.3, height: 0.3, instep: 0.2 },
  medium: { width: 0.6, height: 0.6, instep: 0.5 },
  high: { width: 1.0, height: 1.0, instep: 0.8 },
};

function FootModel({
  modelPath = "/glb/foot.glb",
  shape = "medium",
  volume = "medium",
  scale = 1
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

        // Log available morph targets for debugging
        console.log('Available morph targets:', child.morphTargetDictionary ? Object.keys(child.morphTargetDictionary) : 'None');
        console.log('Number of morph targets:', child.morphTargetInfluences.length);

        // Reset all morphs
        child.morphTargetInfluences.fill(0);

        // Apply shape morphs based on available morph targets
        if (child.morphTargetDictionary) {
          const morphNames = Object.keys(child.morphTargetDictionary);

          // Try to find and apply shape morphs
          if (throttledShape !== 'medium') {
            const shapeMorph = morphNames.find(name => name.toLowerCase().includes(throttledShape.toLowerCase()));
            if (shapeMorph) {
              const index = child.morphTargetDictionary[shapeMorph];
              if (index === undefined) return;
              child.morphTargetInfluences[index] = 1.0;
              console.log(`Applied shape morph: ${shapeMorph} at index ${index}`);
            }
          }

          // Try to find and apply volume morphs
          if (throttledVolume !== 'medium') {
            const volumeMorph = morphNames.find(name =>
              name.toLowerCase().includes(throttledVolume.toLowerCase()) ||
              name.toLowerCase().includes('volume')
            );
            if (volumeMorph) {
              const index = child.morphTargetDictionary[volumeMorph];
              if (index === undefined) return;
              child.morphTargetInfluences[index] = 1.0;
              console.log(`Applied volume morph: ${volumeMorph} at index ${index}`);
            }
          }
        }

        // Fallback to hardcoded indices if no dictionary exists
        if (!child.morphTargetDictionary && child.morphTargetInfluences.length > 0) {
          console.log('Using fallback morph indices');
          // You'll need to adjust these based on your actual GLB morph target order
          if (child.morphTargetInfluences[0] !== undefined) {
            child.morphTargetInfluences[0] = throttledShape === 'egyptian' ? 1 : 0;
          }
          if (child.morphTargetInfluences[1] !== undefined) {
            child.morphTargetInfluences[1] = throttledVolume === 'high' ? 1 : 0;
          }
        }
      }
    });
  }, [gltf.scene, throttledShape, throttledVolume]);

  // Performance: Disable auto-rotate on mobile
  const [autoRotate, setAutoRotate] = useState(true);
  useEffect(() => {
    const checkMobile = () => {
      setAutoRotate(window.innerWidth > 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      <primitive object={gltf.scene} scale={scale} />
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={autoRotate}
        autoRotateSpeed={1}
        target={[0, 0, 0]}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  );
}

// LOD component for mobile optimization
function LODFootModel(props: {
  modelPath?: string;
  shape?: string;
  volume?: string;
  scale?: number;
}) {
  // Use the same model for all devices for now
  // You can create a foot_mobile.glb later if needed
  const modelPath = "/glb/foot.glb";

  return <FootModel {...props} modelPath={modelPath} />;
}

interface FootModelViewerProps {
  shape?: string;
  volume?: string;
  onShapeChange?: (shape: string) => void;
  onVolumeChange?: (volume: string) => void;
}

export default function FootModelViewer({
  shape = "medium",
  volume = "medium",
  onShapeChange,
  onVolumeChange
}: FootModelViewerProps) {
  const [currentShape, setCurrentShape] = useState(shape);
  const [currentVolume, setCurrentVolume] = useState(volume);

  const handleShapeChange = (newShape: string) => {
    setCurrentShape(newShape);
    onShapeChange?.(newShape);
  };

  const handleVolumeChange = (newVolume: string) => {
    setCurrentVolume(newVolume);
    onVolumeChange?.(newVolume);
  };

  return (
    <div className="w-full h-screen bg-slate-950 relative">
      {/* Controls Panel */}
      <div className="absolute top-4 left-4 z-[100] bg-black/90 backdrop-blur-md rounded-xl p-6 text-white w-80 border border-white/30 shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">🦶</span>
          3D Foot Model
        </h2>

        {/* Shape Selector */}
        <div className="space-y-3 mb-6">
          <label className="text-sm font-medium text-gray-300">Foot Shape</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(MORPH_CONFIG).filter(key => !['low', 'medium', 'high'].includes(key)).map(shapeName => (
              <button
                key={shapeName}
                onClick={(e) => {
                  e.stopPropagation();
                  handleShapeChange(shapeName);
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95 relative ${currentShape === shapeName
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
              >
                {shapeName.charAt(0).toUpperCase() + shapeName.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Volume Selector */}
        <div className="space-y-3 mb-6">
          <label className="text-sm font-medium text-gray-300">Foot Volume</label>
          <div className="grid grid-cols-3 gap-2">
            {['low', 'medium', 'high'].map(volumeName => (
              <button
                key={volumeName}
                onClick={(e) => {
                  e.stopPropagation();
                  handleVolumeChange(volumeName);
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95 relative ${currentVolume === volumeName
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
              >
                {volumeName.charAt(0).toUpperCase() + volumeName.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-gray-400 space-y-1 border-t border-gray-700 pt-4">
          <p>🖱️ Drag to rotate</p>
          <p>📚 Scroll to zoom</p>
          <p>📱 Touch enabled</p>
          <p className="text-green-400">✨ Real-time morphing</p>
        </div>
      </div>

      {/* 3D Canvas with performance optimizations */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance"
        }}
        dpr={window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio}
        style={{ background: 'rgb(15 23 42)' }} // slate-950
        className="absolute inset-0"
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />
          <LODFootModel
            shape={currentShape}
            volume={currentVolume}
            scale={1.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

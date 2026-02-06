"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useState, useEffect, useRef } from "react";
import * as THREE from "three";

function AutoCenter({ modelPath, scale = 1 }: { modelPath: string; scale?: number }) {
  const { camera } = useThree();
  const gltf = useGLTF(modelPath);
  const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);

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

    // Auto-adjust camera distance based on model size
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5; // 1.5x for padding

    // Set camera position
    camera.position.set(0, 0, cameraZ);
    camera.lookAt(0, 0, 0);

    // Update controls
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [gltf.scene, modelPath, scale, camera]);

  return (
    <>
      <primitive object={gltf.scene} scale={scale} />
      <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={2}
        target={[0, 0, 0]}
      />
    </>
  );
}

const shoeModels = [
  { name: "Compressed Shoe", path: "/glb/shoe_nomesh.glb", size: "33.7 KB", scale: 1 },
  { name: "Hero Shoe", path: "/glb/HeroShoe.glb", size: "39.1 KB", scale: 1 },
  { name: "Climbing Shoe", path: "/glb/drago.glb", size: "242.3 KB", scale: 1 },
  { name: "Foot Model", path: "/glb/foot.glb", size: "330.5 KB", scale: 1 },
  { name: "Roman Foot", path: "/glb/roman.glb", size: "1.2 MB", scale: 1 },
];

export default function ShoeViewer() {
  const [selectedModel, setSelectedModel] = useState(shoeModels[0]);

  return (
    <div className="w-full h-screen bg-black relative">
      {/* Controls Panel */}
      <div className="absolute top-6 left-6 z-10 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-3xl p-6 text-white max-w-sm">
        <p className="font-mono text-[10px] text-orange-500 tracking-[0.3em] mb-2">[3D_VIEWER]</p>
        <h1 className="font-tanker text-3xl mb-4">MODEL VIEWER</h1>
        
        <div className="space-y-3 mb-4">
          <label className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[SELECT_MODEL]</label>
          <select 
            value={selectedModel.path}
            onChange={(e) => setSelectedModel(shoeModels.find(m => m.path === e.target.value) || shoeModels[0])}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm font-sora focus:border-orange-500 focus:outline-none"
          >
            {shoeModels.map(model => (
              <option key={model.path} value={model.path}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="font-mono text-[10px] text-neutral-600 space-y-1">
          <p>FILE: {selectedModel.name}</p>
          <p>SIZE: {selectedModel.size}</p>
          <p>MOUSE TO ROTATE • SCROLL TO ZOOM</p>
        </div>
      </div>
      
      {/* 3D Canvas */}
      <Canvas 
        key={selectedModel.path}
        camera={{ position: [0, 0, 5], fov: 50 }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1.2} 
            castShadow
          />
          <directionalLight 
            position={[-10, -10, -5]} 
            intensity={0.6} 
            castShadow
          />
          <pointLight position={[0, 5, 0]} intensity={0.8} />
          <pointLight position={[0, -5, 0]} intensity={0.4} />
          
          <AutoCenter modelPath={selectedModel.path} scale={selectedModel.scale} />
        </Suspense>
      </Canvas>
      
      {/* Model Info Panel */}
      <div className="absolute bottom-6 right-6 z-10 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-3xl p-5 text-white">
        <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em] mb-3">[MODELS]</p>
        <div className="space-y-2">
          {shoeModels.map(model => (
            <div 
              key={model.path}
              className={`p-3 rounded-2xl cursor-pointer transition-all text-sm ${
                selectedModel.path === model.path 
                  ? 'bg-orange-500/10 border border-orange-500/30' 
                  : 'bg-neutral-800/50 border border-transparent hover:border-neutral-700'
              }`}
              onClick={() => setSelectedModel(model)}
            >
              <p className="font-sora font-medium">{model.name}</p>
              <p className="font-mono text-[10px] text-neutral-500">{model.size}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

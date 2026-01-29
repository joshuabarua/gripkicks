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
  { name: "Compressed Shoe", path: "/shoe_nomesh.glb", size: "33.7 KB", scale: 1 },
  { name: "Hero Shoe", path: "/HeroShoe.glb", size: "39.1 KB", scale: 1 },
  { name: "Climbing Shoe", path: "/drago.glb", size: "242.3 KB", scale: 1 },
  { name: "Foot Model", path: "/foot.glb", size: "330.5 KB", scale: 1 },
  { name: "Roman Foot", path: "/roman.glb", size: "1.2 MB", scale: 1 },
];

export default function ShoeViewer() {
  const [selectedModel, setSelectedModel] = useState(shoeModels[0]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Controls Panel */}
      <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white max-w-sm">
        <h1 className="text-2xl font-bold mb-4">Shoe Model Viewer</h1>
        
        <div className="space-y-2 mb-4">
          <label className="text-sm text-gray-300">Select Model:</label>
          <select 
            value={selectedModel.path}
            onChange={(e) => setSelectedModel(shoeModels.find(m => m.path === e.target.value) || shoeModels[0])}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            {shoeModels.map(model => (
              <option key={model.path} value={model.path}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="text-xs text-gray-400 space-y-1">
          <p>📁 File: {selectedModel.name}</p>
          <p>📏 Size: {selectedModel.size}</p>
          <p>🖱️ Use mouse to rotate • Scroll to zoom</p>
        </div>
      </div>
      
      {/* 3D Canvas */}
      <Canvas 
        key={selectedModel.path} // Force re-render when model changes
        camera={{ position: [0, 0, 5], fov: 50 }}
      >
        <Suspense fallback={null}>
          {/* Enhanced lighting setup */}
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
      <div className="absolute bottom-4 right-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white">
        <h3 className="text-sm font-semibold mb-2">Available Models</h3>
        <div className="space-y-1 text-xs">
          {shoeModels.map(model => (
            <div 
              key={model.path}
              className={`p-2 rounded cursor-pointer transition-colors ${
                selectedModel.path === model.path 
                  ? 'bg-blue-600/30 border border-blue-400' 
                  : 'bg-gray-800/50 hover:bg-gray-700/50'
              }`}
              onClick={() => setSelectedModel(model)}
            >
              <p className="font-medium">{model.name}</p>
              <p className="text-gray-400">{model.size}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

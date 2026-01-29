import React, { useRef, Suspense, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Object3D, Box3, Vector3 } from "three";

interface CarouselModelProps {
  modelPath: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  isActive?: boolean;
  bobIntensity?: number;
  isHovered?: boolean;
}

export default function CarouselModel({
  modelPath,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  isActive = false,
  bobIntensity = 0.1,
  isHovered = false,
}: CarouselModelProps) {
  const { scene } = useGLTF(modelPath);
  const mesh = useRef<Object3D>(null);
  const hoverTargetY = useRef(0);
  const currentHoverY = useRef(0);

  useEffect(() => {
    if (!scene) return;

    // Calculate bounding box
    const box = new Box3().setFromObject(scene);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());

    // Center the model
    scene.position.x = -center.x;
    scene.position.y = -center.y;
    scene.position.z = -center.z;

    // Apply different tilts based on model type
    if (modelPath.includes('drago')) {
      scene.rotation.x = 0.2; // Increase tilt to about 29 degrees
      scene.rotation.y = -Math.PI / 2; // -90 degrees to show front of shoe
    } else {
      scene.rotation.x = 0.3; // Reduce foot tilt to about 17 degrees
    }

    // Auto-adjust scale based on model size
    const maxDim = Math.max(size.x, size.y, size.z);
    // Make foot models bigger
    const targetSize = modelPath.includes('foot') ? 3 : 2; // Foot is 50% bigger
    const autoScale = targetSize / maxDim;
    
    if (mesh.current) {
      mesh.current.scale.setScalar(autoScale * scale);
    }
  }, [scene, modelPath, scale]);

  useFrame((state) => {
    if (!mesh.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Update hover target
    hoverTargetY.current = isHovered ? 0.2 : 0; // Rise only 0.2 units when hovered
    currentHoverY.current += (hoverTargetY.current - currentHoverY.current) * 0.005; // Much slower transition
    
    // Bobbing motion - much less intense to stay within circle
    const currentBobIntensity = isActive ? bobIntensity * 0.2 : bobIntensity * 0.1;
    if (mesh.current.position) {
      mesh.current.position.y = position[1] + Math.sin(time * 2) * currentBobIntensity + currentHoverY.current;
    }
    
    // Gentle rotation when active
    if (mesh.current.rotation && isActive) {
      mesh.current.rotation.y = rotation[1] + Math.sin(time * 0.5) * 0.1;
    }
  });

  return (
    <Suspense fallback={null}>
      <group 
        ref={mesh}
        scale={scale} 
        position={position} 
        rotation={rotation}
      >
        <primitive object={scene} />
      </group>
    </Suspense>
  );
}

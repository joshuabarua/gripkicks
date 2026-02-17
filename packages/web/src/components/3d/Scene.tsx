"use client";

import React, { Suspense, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import ShoeModel from "./ShoeModel";

const Scene = () => {
  const [contextLost, setContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  const handleContextLost = useCallback((event: WebGLContextEvent) => {
    event.preventDefault();
    console.warn("WebGL context lost, will restore...");
    setContextLost(true);
  }, []);

  const handleContextRestored = useCallback(() => {
    console.log("WebGL context restored");
    setContextLost(false);
    setCanvasKey(prev => prev + 1);
  }, []);

  if (contextLost) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <p>Restoring 3D view...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><span className="text-muted-foreground">Loading 3D...</span></div>}>
      <Canvas
        key={canvasKey}
        style={{ backgroundColor: "transparent" }}
        gl={{
          powerPreference: "high-performance",
          antialias: true,
          preserveDrawingBuffer: true,
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => {
          // Only add event listeners here, not in useEffect
          gl.domElement.addEventListener('webglcontextlost', handleContextLost as EventListener);
          gl.domElement.addEventListener('webglcontextrestored', handleContextRestored);
        }}
      >
        <directionalLight intensity={2} position={[0, 3, 4]} />
        <ambientLight intensity={1} />
        <ShoeModel />
      </Canvas>
    </Suspense>
  );
};

export default Scene;
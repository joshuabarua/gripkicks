"use client";

import React, { Suspense, useState, useEffect, useCallback } from "react";
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

  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('webglcontextlost', handleContextLost as EventListener);
      canvas.addEventListener('webglcontextrestored', handleContextRestored);
      return () => {
        canvas.removeEventListener('webglcontextlost', handleContextLost as EventListener);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      };
    }
  }, [handleContextLost, handleContextRestored, canvasKey]);

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
          // Fix for macOS WebGL vertex attrib 0 warning
          alpha: true,
          premultipliedAlpha: false,
        }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => {
          // Ensure vertex attrib 0 is always enabled (fix for macOS)
          gl.enableVertexAttribArray(0);
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
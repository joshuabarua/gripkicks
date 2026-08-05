"use client";

import React, { Suspense, useState, useCallback, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import ShoeModel from "./ShoeModel";

const Scene = () => {
  const [contextLost, setContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  const canvasConfig = useMemo(
    () => ({
      gl: {
        preserveDrawingBuffer: false,
      },
      dpr: [1, 1.5] as [number, number],
    }),
    [],
  );

  const handleContextLost = useCallback((event: WebGLContextEvent) => {
    event.preventDefault();
    console.warn("WebGL context lost, will restore...");
    setContextLost(true);
  }, []);

  const handleContextRestored = useCallback(() => {
    setContextLost(false);
    setCanvasKey((prev) => prev + 1);
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
    <div className="w-full h-full">
      <Canvas
        key={canvasKey}
        frameloop="always"
        style={{
          backgroundColor: "transparent",
          pointerEvents: "none",
          touchAction: "pan-y",
        }}
        gl={canvasConfig.gl}
        dpr={canvasConfig.dpr}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener(
            "webglcontextlost",
            handleContextLost as EventListener,
          );
          gl.domElement.addEventListener(
            "webglcontextrestored",
            handleContextRestored,
          );
        }}
      >
        <directionalLight intensity={2} position={[0, 3, 4]} />
        <ambientLight intensity={1} />
        <Suspense fallback={null}>
          <Environment preset="city" />
        </Suspense>
        <Suspense fallback={null}>
          <ShoeModel />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;

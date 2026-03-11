"use client";

import React, { Suspense, useState, useCallback, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import ShoeModel from "./ShoeModel";

const Scene = () => {
  const [contextLost, setContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const lowCoreCount = (navigator.hardwareConcurrency ?? 8) <= 4;
    const lowMemory =
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4;
    const smallViewport = window.innerWidth < 1024;

    setIsLowPerformance(
      Boolean(prefersReducedMotion || lowCoreCount || lowMemory || smallViewport),
    );
  }, []);

  const canvasConfig = useMemo(
    () => ({
      gl: {
        powerPreference: isLowPerformance ? "low-power" as const : "high-performance" as const,
        antialias: !isLowPerformance,
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: isLowPerformance,
      },
      dpr: isLowPerformance ? 1 : ([1, 1.5] as [number, number]),
    }),
    [isLowPerformance],
  );

  const handleContextLost = useCallback((event: WebGLContextEvent) => {
    event.preventDefault();
    console.warn("WebGL context lost, will restore...");
    setContextLost(true);
  }, []);

  const handleContextRestored = useCallback(() => {
    console.log("WebGL context restored");
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
    <Suspense fallback={null}>
      <Canvas
        key={canvasKey}
        style={{
          backgroundColor: "transparent",
          pointerEvents: "none",
          touchAction: "pan-y",
        }}
        gl={canvasConfig.gl}
        dpr={canvasConfig.dpr}
        onCreated={({ gl }) => {
          // Only add event listeners here, not in useEffect
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
        <ShoeModel isLowPerformance={isLowPerformance} />
      </Canvas>
    </Suspense>
  );
};

export default Scene;

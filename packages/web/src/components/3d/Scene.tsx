"use client";

import React, { Suspense, useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import ShoeModel from "./ShoeModel";

const Scene = () => {
  const [contextLost, setContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const canvasConfig = useMemo(
    () => ({
      gl: {
        preserveDrawingBuffer: false,
      },
      dpr: [1, 1.5] as [number, number],
    }),
    [],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry?.isIntersecting ?? false),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
    <div ref={containerRef} className="w-full h-full">
      <Suspense fallback={null}>
        <Canvas
          key={canvasKey}
          frameloop={isVisible ? "always" : "demand"}
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
          <ShoeModel />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Scene;

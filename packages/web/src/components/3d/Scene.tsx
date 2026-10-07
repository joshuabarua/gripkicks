"use client";

import React, { Suspense, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, useProgress } from "@react-three/drei";
import ShoeModel from "./ShoeModel";

const Scene = ({ onReady }: { onReady?: () => void }) => {
  const [contextLost, setContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  const canvasConfig = useMemo(
    () => ({
      gl: {
        preserveDrawingBuffer: false,
      },
      dpr: 1,
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
    <div className="relative w-full h-full">
      <SceneLoaderOverlay />
      <SceneReadyWatcher onReady={onReady} />
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

function SceneReadyWatcher({ onReady }: { onReady?: (() => void) | undefined }) {
  const { progress } = useProgress();
  const fired = useRef(false);
  useEffect(() => {
    if (progress >= 100 && !fired.current) {
      fired.current = true;
      onReady?.();
    }
  }, [progress, onReady]);
  return null;
}

function SceneLoaderOverlay() {
  const { active, progress } = useProgress();
  return (
    <div
      style={{ transitionDelay: active ? "0ms" : "400ms" }}
      className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-1000 ${active ? "opacity-100" : "opacity-0"}`}
    >
      <div className="flex items-center gap-3">
        <span className="h-2 w-2 animate-ping rounded-full bg-brand-red" />
        <span className="lab-label">Loading {Math.round(progress)}%</span>
      </div>
    </div>
  );
}

export default Scene;

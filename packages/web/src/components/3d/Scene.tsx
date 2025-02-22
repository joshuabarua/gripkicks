"use client";

import React, { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import ShoeModel from "./ShoeModel";
import { Environment } from "@react-three/drei";

//TODO: Added alpha, drawBuffer- consider removal if buggy

const Scene = () => {
  return (
    <Canvas
      style={{ backgroundColor: "black" }}
      gl={{
        powerPreference: "high-performance",
        antialias: true,
      }}
    >
      <directionalLight intensity={3} position={[0, 3, 4]} />
      <Environment preset="city" />
      <ShoeModel />
    </Canvas>
  );
};

export default Scene;
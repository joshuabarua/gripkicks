"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import ShoeModel from "./ShoeModel";
// // import { Environment } from "@react-three/drei";
// import Loading3D from "./Loading3D";

const Scene = () => {
  return (
    // <Suspense fallback={<Loading3D />}>

    <Canvas
      style={{ backgroundColor: "transparent" }}
      gl={{
        powerPreference: "high-performance",
        antialias: false,
        preserveDrawingBuffer: false,
      }}
      dpr={[1, 1.5]}
    >
      <directionalLight intensity={2} position={[0, 3, 4]} />
      {/* <Environment preset="studio" /> */}
      <ambientLight intensity={1} />
      <ShoeModel />
    </Canvas>
    // </Suspense>
  );
};

export default Scene;
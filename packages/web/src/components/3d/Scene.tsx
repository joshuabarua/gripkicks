'use client'

import React from "react";
import { Canvas } from "@react-three/fiber";
import ShoeModel from "./ShoeModel";
import { Environment } from "@react-three/drei";

const Scene = () => {
    return (
        <Canvas style={{ backgroundColor: "white" }}>
            <directionalLight intensity={3} position={[0, 3, 2]} />
            <Environment preset="city" />
            <ShoeModel />
        </Canvas>
    );
};

export default Scene;
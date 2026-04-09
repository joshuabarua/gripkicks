import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import CarouselModel from "./CarouselModel";
import * as THREE from "three";

interface CharacterSelectorProps {
  onSelectCharacter: (character: string) => void;
}

const characters = [
  { id: 'foot', name: 'Foot Lab', modelPath: '/glb/foot.glb', scale: 0.8, color: 'from-orange-500 via-pink-500 to-purple-600' },
  { id: 'shoe', name: 'Shoe Sanctuary', modelPath: '/glb/drago.glb', scale: 1.2, color: 'from-blue-600 via-cyan-500 to-teal-400' },
];

function RotatingCarousel({ selectedIndex }: { selectedIndex: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useFrame(() => {
    if (!groupRef.current) return;

    // Smooth rotation animation
    targetRotation.current = -selectedIndex * (Math.PI * 2) / characters.length;
    currentRotation.current += (targetRotation.current - currentRotation.current) * 0.1;

    groupRef.current.rotation.y = currentRotation.current;
  });

  return (
    <group ref={groupRef}>
      {characters.map((character, index) => {
        const angle = (index * Math.PI * 2) / characters.length;
        const radius = 3;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;

        // Check if this model is in the front (facing camera)
        const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const normalizedSelectedAngle = ((selectedIndex * Math.PI * 2) / characters.length % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const angleDiff = Math.abs(normalizedAngle - normalizedSelectedAngle);
        const isInFront = angleDiff < Math.PI / 2 || angleDiff > (Math.PI * 3) / 2;

        return (
          <group key={character.id} position={[x, 0, z]}>
            <CarouselModel
              modelPath={character.modelPath}
              scale={character.scale}
              position={[0, 0, 0]}
              rotation={[0, -angle, 0]}
              isActive={index === selectedIndex}
              bobIntensity={0.15}
              isHovered={hoveredIndex === index && isInFront}
            />
            {/* Invisible plane for hover detection - much larger zone */}
            {isInFront && (
              <mesh
                position={[0, 0, 0]}
                onPointerEnter={(e) => {
                  e.stopPropagation();
                  setHoveredIndex(index);
                  document.body.style.cursor = 'pointer';
                }}
                onPointerLeave={(e) => {
                  e.stopPropagation();
                  setHoveredIndex(null);
                  document.body.style.cursor = 'default';
                }}
                visible={false}
              >
                <planeGeometry args={[8, 8]} />
                <meshBasicMaterial transparent opacity={0} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

export default function CharacterSelector({ onSelectCharacter }: CharacterSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handlePrev = () => {
    const newIndex = selectedIndex === 0 ? characters.length - 1 : selectedIndex - 1;
    setSelectedIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = (selectedIndex + 1) % characters.length;
    setSelectedIndex(newIndex);
  };

  const handleSelect = () => {
    const selectedCharacter = characters[selectedIndex];
    if (!selectedCharacter) return;

    onSelectCharacter(selectedCharacter.id);
  };

  const currentCharacter = characters[selectedIndex] ?? characters[0];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* 3D Canvas with side arrows */}
      <div className="relative w-full h-96 mb-8">
        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 flex items-center justify-center group border border-white/30"
          aria-label="Previous character"
        >
          <svg
            className="w-6 h-6 text-white group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 flex items-center justify-center group border border-white/30"
          aria-label="Next character"
        >
          <svg
            className="w-6 h-6 text-white group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <Canvas
          camera={{ position: [0, 0, 8], fov: 45 }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-5, -5, -5]} intensity={0.3} />
          <pointLight position={[0, 3, 3]} intensity={0.6} />
          <pointLight position={[0, -3, 3]} intensity={0.3} />

          <RotatingCarousel
            selectedIndex={selectedIndex}
          />

          <OrbitControls
            enablePan={false}
            enableZoom={false}
            enableRotate={false}
          />
        </Canvas>

        {/* Hover Background - Only Circle Radius - Behind Everything */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-orange-500 pointer-events-none"
            style={{ zIndex: -1 }}
          />
        )}

        {/* Animated Line at 45 Degrees */}
        {isHovered && (
          <motion.svg
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32"
            style={{ stroke: 'rgba(255, 255, 255, 0.8)', strokeWidth: 2, fill: 'none', zIndex: 5 }}
          >
            {/* Starting dot */}
            <motion.circle
              cx="50%"
              cy="50%"
              r="3"
              fill="rgba(255, 255, 255, 0.8)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
            {/* 45-degree line */}
            <motion.line
              x1="50%"
              y1="50%"
              x2="85%"
              y2="15%"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: { duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.3, delay: 0.2 }
              }}
              style={{
                strokeDasharray: 1,
                strokeDashoffset: 0
              }}
            />
            {/* End dot */}
            <motion.circle
              cx="85%"
              cy="15%"
              r="2"
              fill="rgba(255, 255, 255, 0.8)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.7, ease: "easeOut" }}
            />
          </motion.svg>
        )}

        {/* Border Circle Around GLB Model */}
        {isHovered && (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none transition-all duration-500"
            style={{
              backgroundColor: 'transparent',
              border: '3px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 0 8px rgba(255, 255, 255, 0.4), 0 0 16px rgba(255, 255, 255, 0.2), inset 0 0 8px rgba(255, 255, 255, 0.1)',
              animation: 'glow 2s ease-in-out infinite',
              zIndex: 10
            }}
          />
        )}

        {/* Hover Text Overlay - Positioned Above Line */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -70, y: 0 }}
            animate={{ opacity: 1, x: 0, y: -100 }}
            transition={{ duration: 0.4, delay: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
            style={{
              zIndex: 20,
              transform: 'translate(10%, 50%)'
            }}
          >
            <h2 className="text-3xl font-bold mb-2 text-white font-sora drop-shadow-lg">
              {currentCharacter?.name ?? ''}
            </h2>
          </motion.div>
        )}

        {/* Invisible Hover Area - Entire Circle */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full cursor-pointer z-20"
          onClick={handleSelect}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />

        {/* Add glow animation styles */}
        <style jsx>{`
          @keyframes glow {
            0% { 
              opacity: 0;
              box-shadow: 0 0 8px rgba(255, 255, 255, 0.4), 0 0 16px rgba(255, 255, 255, 0.2), inset 0 0 8px rgba(255, 255, 255, 0.1);
            }
            50% { 
              opacity: 1;
              box-shadow: 0 0 12px rgba(255, 255, 255, 0.6), 0 0 24px rgba(255, 255, 255, 0.3), inset 0 0 12px rgba(255, 255, 255, 0.2);
            }
            100% { 
              opacity: 0.8;
              box-shadow: 0 0 8px rgba(255, 255, 255, 0.4), 0 0 16px rgba(255, 255, 255, 0.2), inset 0 0 8px rgba(255, 255, 255, 0.1);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

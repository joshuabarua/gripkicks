'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useReducedEffects } from '@/hooks/useReducedEffects';

const CLOUDS = [
  { src: '/imgs/clouds/cloud1.png', size: 400, duration: 60, delay: 0, top: '10%', direction: 'left' as const },
  { src: '/imgs/clouds/cloud3.png', size: 380, duration: 55, delay: 15, top: '45%', direction: 'right' as const },
  { src: '/imgs/clouds/cloud4.png', size: 420, duration: 50, delay: 8, top: '75%', direction: 'left' as const },
];

export default function CloudBackground() {
  const [mounted, setMounted] = useState(false);
  const isReducedEffects = useReducedEffects();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isReducedEffects) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {CLOUDS.map((cloud, index) => (
        <div
          key={index}
          className="absolute"
          style={{
            width: cloud.size,
            top: cloud.top,
            animation: `cloud-drift-${cloud.direction} ${cloud.duration}s linear ${cloud.delay}s infinite`,
          }}
        >
          <Image
            src={cloud.src}
            alt=""
            width={cloud.size}
            height={cloud.size * 0.6}
            loading="lazy"
            style={{ maxHeight: '400px', width: 'auto', height: 'auto' }}
          />
        </div>
      ))}
      <style jsx>{`
        @keyframes cloud-drift-left {
          from { transform: translateX(-100vw); }
          to { transform: translateX(110vw); }
        }
        @keyframes cloud-drift-right {
          from { transform: translateX(110vw); }
          to { transform: translateX(-100vw); }
        }
      `}</style>
    </div>
  );
}

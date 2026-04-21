'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useReducedEffects } from '@/hooks/useReducedEffects';

type CloudDirection = 'left' | 'right';

type CloudConfig = {
  src: string;
  size: number;
  duration: number;
  top: string;
  direction: CloudDirection;
  opacity: number;
};

const CLOUDS: CloudConfig[] = [
  { src: '/imgs/clouds/cloud1.png', size: 420, duration: 18, top: '12%', direction: 'left', opacity: 0.22 },
  { src: '/imgs/clouds/cloud3.png', size: 380, duration: 20, top: '46%', direction: 'right', opacity: 0.18 },
  { src: '/imgs/clouds/cloud4.png', size: 440, duration: 19, top: '74%', direction: 'left', opacity: 0.2 },
];

const REDUCED_CLOUDS: CloudConfig[] = [
  { src: '/imgs/clouds/cloud3.png', size: 340, duration: 24, top: '20%', direction: 'left', opacity: 0.14 },
];

const NORMAL_GAP_RANGE = [22000, 42000] as const;
const REDUCED_GAP_RANGE = [30000, 54000] as const;

function randomDelay([min, max]: readonly [number, number]) {
  return Math.floor(min + Math.random() * (max - min));
}

export default function CloudBackground() {
  const [mounted, setMounted] = useState(false);
  const [passIndex, setPassIndex] = useState(0);
  const isReducedEffects = useReducedEffects();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const gapRange = isReducedEffects ? REDUCED_GAP_RANGE : NORMAL_GAP_RANGE;
    let timeoutId = window.setTimeout(function scheduleNextPass() {
      setPassIndex((current) => current + 1);
      timeoutId = window.setTimeout(scheduleNextPass, randomDelay(gapRange));
    }, randomDelay(gapRange));

    return () => window.clearTimeout(timeoutId);
  }, [mounted, isReducedEffects]);

  if (!mounted) return null;

  const clouds = isReducedEffects ? REDUCED_CLOUDS : CLOUDS;
  const cloud = clouds[passIndex % clouds.length]!;

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none z-10"
      aria-hidden="true"
    >
      <div
        key={`${cloud.src}-${passIndex}`}
        className="absolute will-change-transform"
        style={{
          width: cloud.size,
          top: cloud.top,
          opacity: cloud.opacity,
          animation: `cloud-drift-${cloud.direction} ${cloud.duration}s linear 1 forwards`,
        }}
      >
        <Image
          src={cloud.src}
          alt=""
          width={cloud.size}
          height={cloud.size * 0.6}
          loading="lazy"
          sizes="(max-width: 1024px) 320px, 420px"
          style={{ maxHeight: '400px', width: 'auto', height: 'auto' }}
        />
      </div>
      <style jsx>{`
        @keyframes cloud-drift-left {
          from { transform: translate3d(-120vw, 0, 0); }
          to { transform: translate3d(120vw, 0, 0); }
        }
        @keyframes cloud-drift-right {
          from { transform: translate3d(120vw, 0, 0); }
          to { transform: translate3d(-120vw, 0, 0); }
        }
      `}</style>
    </div>
  );
}

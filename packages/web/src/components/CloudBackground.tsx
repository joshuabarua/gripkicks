'use client';

import { useSyncExternalStore } from 'react';
import Image from 'next/image';
import { useReducedEffects } from '@/hooks/useReducedEffects';

const subscribe = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

type CloudDirection = 'left' | 'right';

type CloudConfig = {
  src: string;
  size: number;
  duration: number;
  top: string;
  direction: CloudDirection;
  opacity: number;
  delay: number;
};

const CLOUDS: CloudConfig[] = [
  { src: '/imgs/clouds/cloud1.png', size: 420, duration: 30, top: '8%', direction: 'left', opacity: 0.55, delay: -6 },
  { src: '/imgs/clouds/cloud2.png', size: 360, duration: 38, top: '27%', direction: 'right', opacity: 0.42, delay: -19 },
  { src: '/imgs/clouds/cloud3.png', size: 480, duration: 25, top: '46%', direction: 'left', opacity: 0.62, delay: -12 },
  { src: '/imgs/clouds/cloud4.png', size: 400, duration: 34, top: '65%', direction: 'right', opacity: 0.5, delay: -27 },
  { src: '/imgs/clouds/cloud5.png', size: 520, duration: 28, top: '82%', direction: 'left', opacity: 0.46, delay: -9 },
];

const REDUCED_CLOUDS: CloudConfig[] = [
  { src: '/imgs/clouds/cloud3.png', size: 380, duration: 0, top: '24%', direction: 'left', opacity: 0.3, delay: 0 },
];

export default function CloudBackground() {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const isReducedEffects = useReducedEffects();

  if (!mounted) return null;

  const clouds = isReducedEffects ? REDUCED_CLOUDS : CLOUDS;

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none z-10"
      aria-hidden="true"
    >
      {clouds.map((cloud) => (
        <div
          key={cloud.src}
          className="absolute will-change-transform"
          style={{
            width: cloud.size,
            top: cloud.top,
            opacity: cloud.opacity,
            ...(isReducedEffects
              ? { left: '6%' }
              : { animation: `cloud-drift-${cloud.direction} ${cloud.duration}s linear ${cloud.delay}s infinite` }),
          }}
        >
          <Image
            src={cloud.src}
            alt=""
            width={cloud.size}
            height={cloud.size * 0.6}
            loading="lazy"
            sizes="(max-width: 1024px) 360px, 520px"
            style={{ maxHeight: '400px', width: 'auto', height: 'auto' }}
          />
        </div>
      ))}
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

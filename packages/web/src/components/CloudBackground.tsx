'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'framer-motion';
import { useReducedEffects } from '@/hooks/useReducedEffects';
import { useAnimationsEnabled } from '@/stores/useAppStore';

const subscribe = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

type CloudDirection = 'left' | 'right';

interface CloudInstance {
  id: number;
  src: string;
  top: number;
  width: number;
  duration: number;
  direction: CloudDirection;
  opacity: number;
  delay: number;
  animated: boolean;
}

let nextCloudId = 0;

function randomCloud(inFlight: boolean, animated = true): CloudInstance {
  const duration = 24 + Math.random() * 26;
  return {
    id: nextCloudId++,
    src: `/imgs/clouds/cloud${1 + Math.floor(Math.random() * 5)}.png`,
    top: 2 + Math.random() * 83,
    width: 260 + Math.random() * 300,
    duration,
    direction: Math.random() < 0.5 ? 'left' : 'right',
    opacity: 0.35 + Math.random() * 0.3,
    delay: inFlight ? -Math.random() * duration : Math.random() * 8,
    animated,
  };
}

function staticCloud(): CloudInstance {
  const cloud = randomCloud(false, false);
  return { ...cloud, delay: 0 };
}

export default function CloudBackground() {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const isReducedEffects = useReducedEffects();
  const prefersReducedMotion = useReducedMotion();
  const animationsEnabled = useAnimationsEnabled();
  const staticOnly = prefersReducedMotion === true || !animationsEnabled;
  const count = staticOnly ? 3 : isReducedEffects ? 4 : 7;

  const [clouds, setClouds] = useState<CloudInstance[]>(() =>
    Array.from({ length: count }, () => (staticOnly ? staticCloud() : randomCloud(true))),
  );

  const respawn = useCallback((id: number) => {
    setClouds((previous) => previous.map((cloud) => (cloud.id === id ? randomCloud(false) : cloud)));
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const footer = document.querySelector('footer');
      const overlap = footer ? Math.max(0, window.innerHeight - footer.getBoundingClientRect().top) : 0;
      el.style.clipPath = overlap > 0 ? `inset(0 0 ${overlap}px 0)` : '';
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-0 z-10 overflow-hidden" aria-hidden="true">
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          className="absolute will-change-transform"
          onAnimationEnd={cloud.animated ? () => respawn(cloud.id) : undefined}
          style={cloud.animated
            ? { left: 0, top: `${cloud.top}%`, width: cloud.width, opacity: cloud.opacity, animation: `cloud-drift-${cloud.direction} ${cloud.duration}s linear ${cloud.delay}s both` }
            : { left: `${5 + (cloud.id * 29) % 60}%`, top: `${cloud.top}%`, width: cloud.width, opacity: cloud.opacity }}
        >
          <Image
            src={cloud.src}
            alt=""
            width={cloud.width}
            height={cloud.width * 0.6}
            loading="lazy"
            sizes="(max-width: 1024px) 360px, 520px"
            style={{ maxHeight: '400px', width: 'auto', height: 'auto' }}
          />
        </div>
      ))}
    </div>
  );
}

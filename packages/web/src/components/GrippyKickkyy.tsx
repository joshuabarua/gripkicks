'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Lottie from 'lottie-react';

interface LottieMethods {
  play: () => void;
  stop: () => void;
  pause: () => void;
  setSpeed: (speed: number) => void;
  setDirection: (direction: number) => void;
  goToAndStop: (value: number, isFrame?: boolean) => void;
  goToAndPlay: (value: number, isFrame?: boolean) => void;
  destroy: () => void;
  playSegments: (segments: unknown, forceFlag?: boolean) => void;
  setSubframe: (useSubFrames: boolean) => void;
  getDuration: (inFrames?: boolean) => number;
  animationContainerRef: React.RefObject<HTMLDivElement>;
  animationLoaded: boolean;
  animationItem: import('lottie-web').AnimationItem | undefined;
}

interface GrippyKickkyyProps {
  trigger?: 'hover' | 'click' | 'auto' | 'konami' | 'run';
  size?: 'small' | 'medium' | 'large' | 'fullscreen' | 'running';
  position?: 'fixed' | 'absolute' | 'running';
  className?: string;
}

export function GrippyKickkyy({ 
  trigger = 'click', 
  size = 'medium', 
  position = 'fixed',
  className = '' 
}: GrippyKickkyyProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [konamiCode, setKonamiCode] = useState<string[]>([]);
  const [animationData, setAnimationData] = useState<string | null>(null);
  const lottieRef = useRef<LottieMethods>(null);

  // Load lottie animation
  useEffect(() => {
    fetch('/lottie/GrippyKickyy.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading lottie animation:', error));
  }, []);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32', 
    large: 'w-48 h-48',
    fullscreen: 'w-screen h-screen',
    running: 'w-24 h-24'
  };

  const positionClasses = {
    fixed: 'fixed',
    absolute: 'absolute',
    running: 'fixed'
  };

  // Konami code: ↑↑↓↓←→←→BA
  const konamiPattern = useMemo(() => ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'], []);
  const [isRunning, setIsRunning] = useState(true);
  const [runPosition, setRunPosition] = useState({ x: -100, y: 50 });

  useEffect(() => {
    if (trigger !== 'konami') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const newCode = [...konamiCode, e.key].slice(-10);
      setKonamiCode(newCode);

      if (JSON.stringify(newCode) === JSON.stringify(konamiPattern)) {
        triggerAnimation();
        setKonamiCode([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiCode, trigger, konamiPattern]);

  const triggerAnimation = () => {
    if (trigger === 'run') {
      // Start running across screen at bottom
      setIsRunning(true);
      setIsVisible(true);
      setIsAnimating(true);
      setRunPosition({ x: -100, y: 15 }); // y: 15 means 15px from bottom
      

      setTimeout(() => {
        if (lottieRef.current) {
          lottieRef.current.setSpeed(3.5); 
        }
      }, 100); 
      let position = -100;
      const runInterval = setInterval(() => {
        position += 10;
        setRunPosition({ x: position, y: -5 });
        
        if (position > window.innerWidth * 2) { // 200vw (2x viewport width) to ensure full traversal
          clearInterval(runInterval);
          setIsRunning(false);
          setIsVisible(false);
          setIsAnimating(false);
        }
      }, 10); 
    } else {
      setIsVisible(true);
      setIsAnimating(true);
      
      // Speed up animation when it starts
      setTimeout(() => {
        if (lottieRef.current) {
          lottieRef.current.setSpeed(2.5); // Ultra fast!
        }
      }, 100); // Small delay to ensure animation is loaded
      
      // Auto-hide after animation completes
      setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => setIsVisible(false), 100);
      }, trigger === 'click' ? 3000 : 3000); // 3 second loop for click trigger
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      triggerAnimation();
    }
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      triggerAnimation();
    }
  };


  if (!isVisible && trigger === 'click') {
    return (
      <div
        className={`${positionClasses[position]} ${className} cursor-pointer transition-all duration-300 hover:scale-125 flex items-center justify-center`}
        onClick={handleClick}
        style={{ 
          ...(position === 'absolute' ? {} : { bottom: '20px', right: '20px' }),
          zIndex: 9999 
        }}
      >
        {/* Click trigger area */}
        <div className="w-8 h-8 rounded-full transition-all duration-300 bg-blue-500 opacity-30 hover:opacity-60 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white"></div>
        </div>
      </div>
    );
  }

  if (!isVisible && trigger === 'hover') {
    return (
      <div
        className={`${positionClasses[position]} ${sizeClasses[size]} ${className} flex items-center justify-center pointer-events-auto`}
        style={{ 
          zIndex: 9999,
          opacity: 0.3
        }}
        onMouseEnter={handleMouseEnter}
      >
        <div className="w-full h-full rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center">
          <span className="text-xs text-gray-500">Hover</span>
        </div>
      </div>
    );
  }

  if (!isVisible) return null;

  return (
    <div
      className={`${positionClasses[position]} ${sizeClasses[size]} ${className} flex items-center justify-center ${trigger === 'hover' ? 'pointer-events-auto' : 'pointer-events-none'}`}
      style={{ 
        ...(trigger === 'run' 
          ? { left: `${runPosition.x}px`, bottom: `${runPosition.y}px`, top: 'auto', transform: 'none' }
          : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
        ),
        zIndex: 9999,
        opacity: isAnimating ? 1 : 0,
        transition: trigger === 'run' ? 'none' : 'opacity 0.1s ease-in-out'
      }}
      onMouseEnter={handleMouseEnter}
    >
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={isAnimating}
        lottieRef={lottieRef}
        className="w-full h-full"
      />
    </div>
  );
}

// Preset configurations for different hiding spots
export function FooterGrippy() {
  return (
    <GrippyKickkyy 
      trigger="click" 
      size="large" 
    />
  );
}

export function NavigationGrippy() {
  return (
    <GrippyKickkyy 
      trigger="hover" 
      size="small" 
      className="top-16 left-1/2"
    />
  );
}

export function KonamiGrippy() {
  return (
    <GrippyKickkyy 
      trigger="konami" 
      size="fullscreen"
    />
  );
}

export function RunningGrippy() {
  const [shouldRun, setShouldRun] = useState(false);
  
  // Rare timing intervals for production
  useEffect(() => {
    const scheduleNextRun = () => {
      const randomDelay = Math.random() * 900000 + 600000; // 10-25 minutes (very rare)
      const timer = setTimeout(() => {
        setShouldRun(true);
        // Schedule next run after this one completes
        setTimeout(() => {
          setShouldRun(false);
          scheduleNextRun();
        }, 2000); // Run takes about 2 seconds to cross screen
      }, randomDelay);
      
      return timer;
    };
    
    const timer = scheduleNextRun();
    return () => clearTimeout(timer);
  }, []);

  if (!shouldRun) return null;

  return (
    <GrippyKickkyy 
      trigger="run" 
      size="running"
      position="running"
    />
  );
}

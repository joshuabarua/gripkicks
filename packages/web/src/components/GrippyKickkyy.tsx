'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Lottie from 'lottie-react';

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
  const [animationData, setAnimationData] = useState<any>(null);
  const lottieRef = useRef<any>(null);

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
  const [isRunning, setIsRunning] = useState(false);
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
      setRunPosition({ x: -100, y: 85 }); // Fixed at 85% from top (bottom 15%)
      
      // Speed up animation when it starts
      setTimeout(() => {
        if (lottieRef.current) {
          lottieRef.current.setSpeed(3.5); // Ultra fast!
        }
      }, 100); // Small delay to ensure animation is loaded
      // Animate across screen
      let position = -100;
      const runInterval = setInterval(() => {
        position += 12; // Even faster movement
        setRunPosition({ x: position, y: 85 });
        
        if (position > window.innerWidth + 100) {
          clearInterval(runInterval);
          setIsRunning(false);
          setIsVisible(false);
          setIsAnimating(false);
        }
      }, 10); // Even faster interval
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

  // Auto trigger for development fun
  useEffect(() => {
    if (trigger === 'auto') {
      const timer = setTimeout(() => {
        triggerAnimation();
      }, Math.random() * 30000 + 10000); // Random between 10-40 seconds
      
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!isVisible && trigger === 'click') {
    return (
      <div
        className={`${positionClasses[position]} ${className} cursor-pointer transition-all duration-300 hover:scale-125`}
        onClick={handleClick}
        style={{ 
          bottom: '20px', 
          right: '20px',
          zIndex: 9999 
        }}
      >
        {/* Tiny hidden trigger dot */}
        <div className="w-2 h-2 rounded-full transition-all duration-300 bg-gray-300 opacity-20 hover:opacity-40" />
      </div>
    );
  }

  if (!isVisible) return null;

  return (
    <div
      className={`${positionClasses[position]} ${sizeClasses[size]} ${className} flex items-center justify-center pointer-events-none`}
      style={{ 
        ...(trigger === 'run' 
          ? { left: `${runPosition.x}px`, top: `${runPosition.y}%`, transform: 'translateY(-50%)' }
          : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
        ),
        zIndex: 9999,
        opacity: isAnimating ? 1 : 0,
        transition: trigger === 'run' ? 'none' : 'opacity 0.1s ease-in-out'
      }}
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

export function LoadingGrippy() {
  return (
    <GrippyKickkyy 
      trigger="auto" 
      size="medium"
    />
  );
}

export function RunningGrippy() {
  const [shouldRun, setShouldRun] = useState(false);
  
  // Random timing intervals
  useEffect(() => {
    const scheduleNextRun = () => {
      const randomDelay = Math.random() * 20000 + 10000; // 10-30 seconds
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

'use client';

import { useEffect } from 'react';
import { useOrientationStore } from '@/stores/orientationStore';

export function OrientationInitializer() {
  const initialize = useOrientationStore((state) => state.initialize);
  const cleanup = useOrientationStore((state) => state.cleanup);

  useEffect(() => {
    initialize();
    return () => cleanup();
  }, [initialize, cleanup]);

  return null;
}

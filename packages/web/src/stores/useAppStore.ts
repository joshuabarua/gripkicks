import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStore {
  animationsEnabled: boolean;
  highPerformanceMode: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
  setHighPerformanceMode: (enabled: boolean) => void;
}

const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      animationsEnabled: true,
      highPerformanceMode: false,
      setAnimationsEnabled: (enabled) => set({ animationsEnabled: enabled }),
      setHighPerformanceMode: (enabled) => set({ highPerformanceMode: enabled }),
    }),
    {
      name: 'gripkicks-app-store',
    }
  )
);

// Performance-optimized selectors
export const useAnimationsEnabled = () => useAppStore((state) => state.animationsEnabled);
export const useHighPerformanceMode = () => useAppStore((state) => state.highPerformanceMode);

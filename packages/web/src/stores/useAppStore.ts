import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPreferences {
  theme: 'dark' | 'light';
  animationsEnabled: boolean;
  highPerformanceMode: boolean;
  autoSaveEnabled: boolean;
}

interface UIState {
  sidebarOpen: boolean;
  searchQuery: string;
  selectedFilters: Record<string, string>;
  loadingStates: Record<string, boolean>;
}

interface AppStore extends UserPreferences, UIState {
  // User preferences
  setTheme: (theme: 'dark' | 'light') => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setHighPerformanceMode: (enabled: boolean) => void;
  setAutoSaveEnabled: (enabled: boolean) => void;
  
  // UI state
  setSidebarOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedFilter: (key: string, value: string) => void;
  clearFilters: () => void;
  setLoadingState: (key: string, loading: boolean) => void;
  
  // Performance helpers
  resetToDefaults: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Default user preferences
      theme: 'dark',
      animationsEnabled: true,
      highPerformanceMode: false,
      autoSaveEnabled: true,
      
      // Default UI state
      sidebarOpen: false,
      searchQuery: '',
      selectedFilters: {},
      loadingStates: {},
      
      // User preference setters
      setTheme: (theme) => set({ theme }),
      setAnimationsEnabled: (enabled) => set({ animationsEnabled: enabled }),
      setHighPerformanceMode: (enabled) => set({ highPerformanceMode: enabled }),
      setAutoSaveEnabled: (enabled) => set({ autoSaveEnabled: enabled }),
      
      // UI state setters
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedFilter: (key, value) => 
        set((state) => ({
          selectedFilters: { ...state.selectedFilters, [key]: value }
        })),
      clearFilters: () => set({ selectedFilters: {}, searchQuery: '' }),
      setLoadingState: (key, loading) => 
        set((state) => ({
          loadingStates: { ...state.loadingStates, [key]: loading }
        })),
      
      // Performance helpers
      resetToDefaults: () => set({
        theme: 'dark',
        animationsEnabled: true,
        highPerformanceMode: false,
        autoSaveEnabled: true,
        sidebarOpen: false,
        searchQuery: '',
        selectedFilters: {},
        loadingStates: {},
      }),
    }),
    {
      name: 'gripkicks-app-store',
      partialize: (state) => ({
        theme: state.theme,
        animationsEnabled: state.animationsEnabled,
        highPerformanceMode: state.highPerformanceMode,
        autoSaveEnabled: state.autoSaveEnabled,
      }),
    }
  )
);

// Performance-optimized selectors
export const useTheme = () => useAppStore((state) => state.theme);
export const useAnimationsEnabled = () => useAppStore((state) => state.animationsEnabled);
export const useHighPerformanceMode = () => useAppStore((state) => state.highPerformanceMode);
export const useSearchQuery = () => useAppStore((state) => state.searchQuery);
export const useSelectedFilters = () => useAppStore((state) => state.selectedFilters);
export const useLoadingStates = () => useAppStore((state) => state.loadingStates);

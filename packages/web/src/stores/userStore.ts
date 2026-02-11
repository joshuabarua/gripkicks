import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  image: string;
  emailVerified: boolean;
  isAdmin?: boolean;
}

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  isHydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      isHydrated: false,
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
    }),
    {
      name: 'user-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

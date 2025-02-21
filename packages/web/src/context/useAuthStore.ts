import { create } from 'zustand';
import { signOut, useSession } from '@/lib/client-auth';
import type { User } from '../../types/user';
import React from 'react';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  initialized: boolean;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  error: null,
  initialized: false,
  logout: async () => {
    try {
      await signOut();
      set({ user: null });
    } catch (error) {
      set({ error: error as Error });
    }
  },
}));

// Hook to sync auth state
export const useAuth = () => {
  const store = useAuthStore();
  const session = useSession;
  const set = useAuthStore.setState;

  React.useEffect(() => {
    const unsubscribe = session.subscribe((state) => {
      set({
        user: state.data?.user ?? null,
        isLoading: state.isPending,
        error: state.error,
        initialized: true,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    user: store.user,
    isLoading: store.isLoading,
    error: store.error,
    initialized: store.initialized,
    logout: store.logout,
  };
};
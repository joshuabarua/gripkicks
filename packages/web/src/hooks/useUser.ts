import { useUserStore } from '@/stores/userStore';

export function useUser() {
  const { user, setUser, clearUser, isHydrated } = useUserStore();
  
  return {
    user,
    setUser,
    clearUser,
    isHydrated,
    isAuthenticated: !!user,
    isLoading: !isHydrated,
  };
}

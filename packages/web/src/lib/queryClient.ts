import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { authClient, Session, AuthError } from './auth';
import { User } from '../../types/user';

const fetchSession = async (): Promise<Session | null> => {
  return authClient.getSession();
};
const fetchCurrentUser = async (): Promise<User | null> => {
  const session = await authClient.getSession();
  return session?.user || null;
};

const loginUser = async ({ 
  email, 
  password 
}: { 
  email: string; 
  password: string;
}): Promise<{ user: User; error?: AuthError }> => {
  return authClient.login(email, password);
};

const signUpUser = async ({ 
  email, 
  password,
  name
}: { 
  email: string; 
  password: string;
  name?: string;
}): Promise<{ user: User; error?: AuthError }> => {
  return authClient.signUp(email, password, name);
};

const signOutUser = async (): Promise<boolean> => {
  return authClient.signOut();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
    },
  },
});

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: signUpUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

export function useSignOut() {
  return useMutation({
    mutationFn: signOutUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

import { QueryClient, QueryFunction, useMutation, useQuery } from '@tanstack/react-query';

const fetchSession: QueryFunction<unknown, readonly unknown[]> = async ({ queryKey, signal, meta }) => {
    const [key, { email, password, googleToken }] = queryKey as [string, { email: string; password?: string; googleToken?: string; }];
  const params = new URLSearchParams();
  params.append('email', email);
  if (password) params.append('password', password);
  if (googleToken) params.append('googleToken', googleToken);

  const response = await fetch(`/api/session?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

async function fetchUser({ queryKey }: { queryKey: (string | { email: string, password?: string, googleToken?: string })[] }) {
    const [key, { email, password, googleToken }] = queryKey as [string, { email: string; password?: string; googleToken?: string; }];
    const params = new URLSearchParams();
    params.append('email', email);
    if (password) params.append('password', password);
    if (googleToken) params.append('googleToken', googleToken);
  
    const response = await fetch(`/api/login?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to login');
    }
    return response.json();
  }

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: fetchSession,
      },

    },
  });

export function useSession({ email, password, googleToken }: { email: string, password?: string, googleToken?: string }) {
  return useQuery({
    queryKey: ['session', { email, password, googleToken }],
    queryFn: fetchSession
  });
};

export function useUser({ email, password, googleToken }: { email: string, password?: string, googleToken?: string }) {
  return useQuery({
    queryKey: ['user', { email, password, googleToken }], 
    queryFn: fetchUser
});
};

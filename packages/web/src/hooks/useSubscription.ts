import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/auth';
import { fetchApi } from '@/lib/api-client';

interface SubscriptionData {
  subscriptionStatus: string | null;
  subscriptionTier: string | null;
  polarCustomerId: string | null;
  polarSubscriptionId: string | null;
  subscriptionExpiresAt: number | null;
  isPremium: boolean;
}

interface UseSubscriptionReturn {
  isPremium: boolean;
  subscriptionStatus: string | null;
  subscriptionTier: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useSubscription(): UseSubscriptionReturn {
  const { data: session } = useSession();
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!session?.user) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await fetchApi<SubscriptionData>(
      '/api/v1/polar/subscription'
    );

    if (result.isOk()) {
      setData(result.value);
    } else {
      setError(result.error.message);
      setData(null);
    }

    setLoading(false);
  }, [session?.user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    isPremium: data?.isPremium ?? false,
    subscriptionStatus: data?.subscriptionStatus ?? null,
    subscriptionTier: data?.subscriptionTier ?? null,
    loading,
    error,
    refresh: fetchSubscription,
  };
}

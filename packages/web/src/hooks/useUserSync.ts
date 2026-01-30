import { useEffect } from 'react';
import { useSession } from '@/lib/auth';

export function useUserSync() {
  const { data: session, isPending } = useSession();

  useEffect(() => {
    // Only sync when we have a session and it's not pending
    if (session?.user && !isPending) {
      const syncUserToConvex = async () => {
        try {
          console.log('useUserSync: Syncing user to Convex:', session.user.email);
          
          // Call backend which will sync to Convex
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/sync-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: session.user.id,
              email: session.user.email,
              name: session.user.name || '',
              image: session.user.image || '',
              emailVerified: session.user.emailVerified || false,
            }),
          });

          if (!response.ok) {
            const errorData = await response.text();
            console.error('useUserSync: Failed to sync user to Convex:', errorData);
          } else {
            const result = await response.json();
            console.log('useUserSync: User synced to Convex successfully:', result);
          }
        } catch (error) {
          console.error('useUserSync: Error syncing user to Convex:', error);
        }
      };

      syncUserToConvex();
    }
  }, [session, isPending]);
}

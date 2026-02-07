'use client';

import { useSession } from '@/lib/auth';
import { useState, useEffect } from 'react';

interface BackendStatusType {
  status: 'healthy' | 'degraded' | 'auth_required' | 'unavailable' | 'error';
  backend?: string;
  responseTime?: string;
  message?: string;
  error?: string;
}

export function AuthDebug() {
  const { data: session, isPending: isLoading, error } = useSession();
  const [backendStatus, setBackendStatus] = useState<BackendStatusType | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [mounted, setMounted] = useState(false);

  async function checkBackendHealth() {
    setIsChecking(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/healthz`);
      const data = await response.json();
      setBackendStatus(data);
    } catch (err) {
      setBackendStatus({ status: 'error', error: String(err) });
    } finally {
      setIsChecking(false);
    }
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      checkBackendHealth();
    }
  }, [mounted]);

  return (
    <div className="p-4 border rounded bg-slate-50 text-black my-4 text-sm">
      <h3 className="text-lg font-bold mb-2">Auth Debug</h3>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="font-medium">Backend Status:</div>
        <div>
          {isChecking ? 'Checking...' :
            backendStatus ? (
              <span className={
                backendStatus.status === 'healthy' ? 'text-green-600' :
                  backendStatus.status === 'auth_required' ? 'text-blue-600' :
                    'text-red-600'
              }>
                {backendStatus.status} ({backendStatus.responseTime})
              </span>
            ) : 'Unknown'
          }
          {backendStatus?.message && (
            <p className="text-xs text-gray-600">{backendStatus.message}</p>
          )}
        </div>

        <div className="font-medium">Session Status:</div>
        <div>
          {isLoading ? 'Loading...' :
            error ? <span className="text-red-600">Error: {String(error)}</span> :
              session?.user ? (
                <span className="text-green-600">Authenticated</span>
              ) : <span className="text-yellow-600">Not Authenticated</span>
          }
        </div>

        <div className="font-medium">User:</div>
        <div>
          {session?.user ? JSON.stringify(session.user) : 'Not logged in'}
        </div>
      </div>

      <button
        onClick={checkBackendHealth}
        disabled={isChecking}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-xs"
      >
        {isChecking ? 'Checking...' : 'Check Backend'}
      </button>
    </div>
  );
}

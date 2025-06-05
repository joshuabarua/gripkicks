import { NextResponse } from 'next/server';

// Backend API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Health check endpoint to verify backend connectivity
 * GET /api/auth/healthz
 */
export async function GET() {
  const start = Date.now();
  
  try {
    // Try to reach the backend auth service
    const response = await fetch(`${API_URL}/api/healthz`, { 
      method: 'GET',
      cache: 'no-store',
      // Short timeout to fail fast
      signal: AbortSignal.timeout(3000)
    });
    
    // Calculate response time
    const responseTime = Date.now() - start;
    
    if (response.ok) {
      // Backend is available
      return NextResponse.json({ 
        status: 'healthy',
        backend: 'connected',
        responseTime: `${responseTime}ms`
      });
    } else {
      // Backend returned an error
      return NextResponse.json({
        status: 'degraded',
        backend: `error ${response.status}`,
        responseTime: `${responseTime}ms`
      }, { status: 207 });
    }
  } catch (error) {
    // Backend is not reachable
    const responseTime = Date.now() - start;
    
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unavailable',
      backend: 'disconnected',
      responseTime: `${responseTime}ms`,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}

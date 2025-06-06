import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Health check endpoint to verify backend connectivity
 * GET /api/auth/healthz
 */
export async function GET() {
  const start = Date.now();
  
  try {
    const response = await fetch(`${API_URL}/api/healthz`, { 
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(3000)
    });
    
    const responseTime = Date.now() - start;
    
    
    if (response.ok || response.status === 401) {
      return NextResponse.json({ 
        status: response.ok ? 'healthy' : 'auth_required',
        backend: 'connected',
        responseTime: `${responseTime}ms`,
        message: response.status === 401 
          ? 'Backend available but requires authentication (401 is normal)'
          : undefined
      });
    } else {
      return NextResponse.json({
        status: 'degraded',
        backend: `error ${response.status}`,
        responseTime: `${responseTime}ms`
      }, { status: 207 });
    }
  } catch (error) {
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

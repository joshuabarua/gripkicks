import { NextRequest, NextResponse } from 'next/server';

// Backend API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Enable debug mode for detailed error logging
const DEBUG = process.env.NODE_ENV === 'development';

// Health check to verify if backend is available
let backendAvailable: boolean | null = null;
let lastHealthCheck = 0;

// Check if backend is available
async function checkBackendHealth(): Promise<boolean> {
  // Only check once every 30 seconds
  if (backendAvailable !== null && Date.now() - lastHealthCheck < 30000) {
    return backendAvailable;
  }

  try {
    if (DEBUG) console.log(`Checking backend health at ${API_URL}/api/healthz`);
    const response = await fetch(`${API_URL}/api/healthz`, { 
      method: 'GET',
      cache: 'no-store',
    }).then(res => res.ok);
    
    backendAvailable = response;
    lastHealthCheck = Date.now();
    return response;
  } catch (error) {
    console.error('Backend health check failed:', error);
    backendAvailable = false;
    lastHealthCheck = Date.now();
    return false;
  }
}

// Proxy API requests to the backend
async function handler(request: NextRequest, method: string) {
  try {
    // Get path parameters (after [...better-auth])
    const path = request.nextUrl.pathname.replace('/api/auth', '');
    const url = `${API_URL}/api${path}`;
    
    if (DEBUG) console.log(`Proxying ${method} request to: ${url}`);

    // Check if backend is available (fast local check)
    if (await checkBackendHealth() === false && path !== '/healthz') {
      if (DEBUG) console.log('Backend is unavailable, returning 503');
      return NextResponse.json(
        { error: 'Authentication service unavailable' }, 
        { status: 503 }
      );
    }
    
    // Get request headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    
    // Forward cookies if present
    const cookie = request.headers.get('cookie');
    if (cookie) headers.set('cookie', cookie);
    
    // Forward the request to our backend
    const response = await fetch(url, {
      method,
      headers,
      body: method !== 'GET' ? await request.text() : undefined,
      credentials: 'include',
    });

    // Get response data and headers
    const data = await response.json().catch(() => ({}));
    
    // Pass through cookies from backend
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (key.toLowerCase().includes('cookie')) {
        responseHeaders.set(key, value);
      }
    });
    
    // Return the proxied response
    return NextResponse.json(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    // Provide detailed error for debugging
    console.error('Auth proxy error:', error);
    
    // Create a user-friendly error message
    let errorMessage = 'Authentication service unavailable';
    let statusCode = 500;
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      statusCode = 503;
      errorMessage = 'Network error: Unable to connect to authentication service';
    }
    
    if (DEBUG) {
      console.log(`Returning error ${statusCode}: ${errorMessage}`);
      return NextResponse.json({ 
        error: errorMessage,
        details: error instanceof Error ? error.message : String(error)
      }, { status: statusCode });
    }
    
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

// Handle GET requests
export async function GET(request: NextRequest) {
  return handler(request, 'GET');
}

// Handle POST requests
export async function POST(request: NextRequest) {
  return handler(request, 'POST');
}
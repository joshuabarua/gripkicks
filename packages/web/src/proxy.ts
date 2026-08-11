import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/stash',
];

// Routes that should redirect to home if already authenticated
const authRoutes = [
  '/auth/login',
  '/auth/signup',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
  const safeCallbackUrl = callbackUrl?.startsWith('/') ? callbackUrl : '/dashboard';
  
  // Check for session cookie. Better Auth might use prefixes like __Secure-
  const cookies = request.cookies.getAll();
  const sessionToken = cookies.find(c => c.name.includes('better-auth.session_token'));
  const isAuthenticated = !!sessionToken;

  // Check if trying to access a protected route without auth
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    const nextPath = `${pathname}${request.nextUrl.search}`;
    loginUrl.searchParams.set('callbackUrl', nextPath);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(safeCallbackUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and api routes
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from '@/lib/auth'
import { fetchApi } from '@/lib/api-client'

interface OnboardingGuardProps {
  children: React.ReactNode
}

/** Paths that never need onboarding checks or session gating */
const PUBLIC_PATH_PREFIXES = ['/auth', '/onboarding', '/about', '/privacy', '/pricing']
const PUBLIC_EXACT = ['/']
const ONBOARDING_OPTIONAL_PATH_PREFIXES = ['/footscan']

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.includes(pathname)) return true
  return PUBLIC_PATH_PREFIXES.some(prefix => pathname.startsWith(prefix))
}

function isOnboardingOptionalPath(pathname: string): boolean {
  return ONBOARDING_OPTIONAL_PATH_PREFIXES.some(prefix => pathname.startsWith(prefix))
}

/** Max time (ms) to wait for session before giving up and rendering anyway */
const SESSION_TIMEOUT_MS = 5_000

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, isPending: sessionLoading } = useSession()
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true)
  const [sessionTimedOut, setSessionTimedOut] = useState(false)

  // Public pages render immediately — no session/onboarding gate
  const isPublic = isPublicPath(pathname)
  const allowsIncompleteOnboarding = isOnboardingOptionalPath(pathname)

  // Timeout: if session is still pending after N seconds, stop blocking
  useEffect(() => {
    if (!sessionLoading) return

    const timer = setTimeout(() => {
      console.warn('[OnboardingGuard] Session loading timed out — rendering anyway')
      setSessionTimedOut(true)
    }, SESSION_TIMEOUT_MS)

    return () => clearTimeout(timer)
  }, [sessionLoading])

  const checkOnboarding = useCallback(async () => {
    // Not authenticated or still loading with no timeout → skip
    if (!session?.user) {
      setIsCheckingOnboarding(false)
      return
    }

    // Public path → no redirect needed
    if (isPublic || allowsIncompleteOnboarding) {
      setIsCheckingOnboarding(false)
      return
    }

    try {
      const result = await fetchApi('/api/v1/profile');

      // Handle the Result type properly
      if (result.isOk()) {
        const profileData = result.value as { onboardingComplete?: boolean };

        // If user hasn't completed onboarding, redirect to onboarding
        if (!profileData.onboardingComplete) {
          router.push('/onboarding')
        }
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error)
    } finally {
      setIsCheckingOnboarding(false)
    }
  }, [session?.user, isPublic, allowsIncompleteOnboarding, router])

  useEffect(() => {
    // Wait for session to resolve (or time out) before checking onboarding
    if (sessionLoading && !sessionTimedOut) return

    checkOnboarding()
  }, [sessionLoading, sessionTimedOut, checkOnboarding])

  // Public pages: always render immediately
  if (isPublic) {
    return <>{children}</>
  }

  // Protected pages: show spinner only while genuinely waiting
  const stillWaiting = (sessionLoading && !sessionTimedOut) || isCheckingOnboarding
  if (stillWaiting) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Render children after checking
  return <>{children}</>
}

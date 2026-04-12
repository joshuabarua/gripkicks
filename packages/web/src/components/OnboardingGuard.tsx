'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from '@/lib/auth'
import { fetchApi } from '@/lib/api-client'
import { useLoading } from '@/contexts/LoadingContext'

interface OnboardingGuardProps {
  children: React.ReactNode
}

/** Paths that never need onboarding checks or session gating */
const PUBLIC_PATH_PREFIXES = ['/auth', '/onboarding', '/about', '/privacy', '/pricing']
const PUBLIC_EXACT = ['/']
function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.includes(pathname)) return true
  return PUBLIC_PATH_PREFIXES.some(prefix => pathname.startsWith(prefix))
}

/** Max time (ms) to wait for session before giving up and rendering anyway */
const SESSION_TIMEOUT_MS = 5_000

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const pathname = usePathname()
  const { data: session, isPending: sessionLoading } = useSession()
  const [sessionTimedOut, setSessionTimedOut] = useState(false)
  const { showLoader, hideLoader } = useLoading()

  // Public pages render immediately — no session/onboarding gate
  const isPublic = isPublicPath(pathname)

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
    if (!session?.user || isPublic) {
      return
    }

    showLoader('onboarding')
    try {
      const result = await fetchApi('/api/v1/profile');
      if (result.isOk()) {
        const profileData = result.value as { onboardingComplete?: boolean };
        if (!profileData.onboardingComplete) {
          console.log('[OnboardingGuard] Onboarding incomplete — allowing access anyway');
        }
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error)
    } finally {
      hideLoader('onboarding')
    }
  }, [session?.user, isPublic, showLoader, hideLoader])

  useEffect(() => {
    // Wait for session to resolve (or time out) before checking onboarding
    if (sessionLoading && !sessionTimedOut) {
      showLoader('session')
      return
    }
    
    if (sessionLoading) return
    hideLoader('session')
    checkOnboarding()
  }, [sessionLoading, sessionTimedOut, checkOnboarding, showLoader, hideLoader])

  // Public pages: always render immediately
  if (isPublic) {
    return <>{children}</>
  }

  // Always render children - loading is handled by PageTransition overlay
  return <>{children}</>
}

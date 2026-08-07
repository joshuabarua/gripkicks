'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from '@/lib/auth'
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
  const { isPending: sessionLoading } = useSession()
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

  useEffect(() => {
    // Public pages never show the session loader overlay
    if (isPublic) {
      hideLoader('session')
      return
    }

    // Show loader only while actively loading and not timed out
    if (sessionLoading && !sessionTimedOut) {
      showLoader('session')
      return
    }

    // Hide loader once loading finishes OR we time out
    hideLoader('session')
  }, [isPublic, sessionLoading, sessionTimedOut, showLoader, hideLoader])

  // Public pages: always render immediately
  if (isPublic) {
    return <>{children}</>
  }

  // Always render children - loading is handled by PageTransition overlay
  return <>{children}</>
}

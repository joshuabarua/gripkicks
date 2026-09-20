'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from '@/lib/auth'
import { useLoading } from '@/contexts/LoadingContext'

interface OnboardingGuardProps {
  children: React.ReactNode
}

const PUBLIC_PATH_PREFIXES = ['/auth', '/onboarding', '/about', '/privacy', '/pricing']
const PUBLIC_EXACT = ['/']

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.includes(pathname)) return true
  return PUBLIC_PATH_PREFIXES.some(prefix => pathname.startsWith(prefix))
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const pathname = usePathname()
  const { isPending: sessionLoading } = useSession()
  const { showLoader, hideLoader } = useLoading()

  const isPublic = isPublicPath(pathname)

  useEffect(() => {
    if (!isPublic && sessionLoading) {
      showLoader('session')
      return
    }
    hideLoader('session')
  }, [isPublic, sessionLoading, showLoader, hideLoader])

  return <>{children}</>
}

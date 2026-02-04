'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth'
import { fetchApi } from '@/lib/api-client'

interface OnboardingGuardProps {
  children: React.ReactNode
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter()
  const { data: session, isPending: sessionLoading } = useSession()
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true)

  useEffect(() => {
    async function checkOnboardingStatus() {
      // Don't check if session is loading or user is not authenticated
      if (sessionLoading || !session?.user) {
        setIsCheckingOnboarding(false)
        return
      }

      // Don't redirect if already on auth, onboarding, or selector pages
      const publicPaths = ['/auth', '/onboarding', '/selector']
      if (publicPaths.some(path => window.location.pathname.startsWith(path))) {
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
          } else if (profileData.onboardingComplete) {
            // If onboarding is complete and user is on home, redirect to dashboard
            if (window.location.pathname === '/') {
              router.push('/dashboard')
            }
          }
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error)
      } finally {
        setIsCheckingOnboarding(false)
      }
    }

    checkOnboardingStatus()
  }, [session, sessionLoading, router])

  // Show loading spinner while checking onboarding status
  if (sessionLoading || isCheckingOnboarding) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Render children after checking
  return <>{children}</>
}

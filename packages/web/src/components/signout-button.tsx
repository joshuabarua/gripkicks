'use client'

import { useSignOut } from "@/lib/queryClient"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import useSessionStore from "@/store/sessionStore"

interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
  onClick?: () => void
}

export function SignOutButton({
  variant = "default",
  size = "default",
  className,
  children,
  onClick,
}: SignOutButtonProps) {
  const router = useRouter()
  const { setSessionData } = useSessionStore()
  const signOut = useSignOut()

  const handleSignOut = () => {
    signOut.mutate(undefined, {
      onSuccess: () => {
        if (onClick) {
          onClick();
        }
        setSessionData(null)
        router.push("/auth/login")
      },
      onError: (error: unknown) => {
        console.error("Error signing out:", error)
      }
    })
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className}
      onClick={handleSignOut}
      disabled={signOut.isPending}
    >
      {signOut.isPending ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {children || "Signing out..."}
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          {children || "Sign out"}
        </span>
      )}
    </Button>
  )
}

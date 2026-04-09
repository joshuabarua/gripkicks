'use client'

import { signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
  onClick?: () => void
  showIcon?: boolean
}

export function SignOutButton({
  variant = "default",
  size = "default",
  className,
  children,
  onClick,
  showIcon = true,
}: SignOutButtonProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onRequest: () => {
            setIsPending(true)
          },
          onResponse: () => {
            setIsPending(false)
          },
          onSuccess: () => {
            onClick?.()
            router.push("/auth/login")
          },
          onError: (ctx) => {
            console.error("SignOutButton: Error signing out:", ctx.error);
            setIsPending(false);
            // You might want to show a toast notification here
          },
        },
      })
    } catch (error) {
      console.error('SignOutButton: Unexpected error:', error);
      setIsPending(false);
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleSignOut}
      disabled={isPending}
    >
      {isPending ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {children ?? "Signing out..."}
        </span>
      ) : (
        <span className="flex items-center gap-2">
          {showIcon && <LogOut className="h-4 w-4" />}
          {children ?? "Sign out"}
        </span>
      )}
    </Button>
  )
}

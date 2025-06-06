'use client'

import { LoginForm } from "@/components/login-form"
import { AuthDebug } from "@/components/auth-debug";

export default function Login() {  


  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
        
        {process.env.NODE_ENV === 'development' && <AuthDebug />}
      </div>
    </div>
  )
}

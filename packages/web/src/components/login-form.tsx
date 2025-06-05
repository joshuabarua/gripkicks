'use client'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2, Key } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils"
import { useLogin } from "@/lib/queryClient";
import { useState } from "react";
import useSessionStore from "@/store/sessionStore";

export function LoginForm({
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const { setSessionData } = useSessionStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  // Use TanStack Query for login mutation
  const login = useLogin();
  
  // Derive state from query instead of useState
  const loading = login.isPending;
  const error = login.error ? 
    (login.error instanceof Error ? login.error.message : 'Authentication failed') : 
    null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await login.mutateAsync({ email, password });
      
      if (!result.error) {
        if (rememberMe) {
          setSessionData({
            email,
            rememberMe: true,
            lastLogin: new Date().toISOString()
          });
        } else {
          setSessionData(null);
        }
        
        router.push("/");
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="johndoe@example.com"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/reset-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="rememberMe">Remember me</Label>
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <Button disabled={loading} type="submit" className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Login
                </>
              )}
            </Button>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup">
                <span className="underline underline-offset-4">Sign up</span>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

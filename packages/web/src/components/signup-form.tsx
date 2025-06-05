'use client'

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type React from "react";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useSignUp } from "@/lib/queryClient";
import { useRouter } from 'next/navigation';

export function SignupForm() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const router = useRouter();
  
  const signup = useSignUp();
  
  const loading = signup.isPending;
  const error = signup.error ? 
    (signup.error instanceof Error ? signup.error.message : 'Registration failed') : 
    null;

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Create an account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" type="text" placeholder="John Doe" required onChange={(e) => {
                  setUserName(e.target.value);
                }}
                  value={userName} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="johndoe@example.com"
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  value={email}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" onChange={(e) => {
                  setPassword(e.target.value);
                }}
                  value={password} required minLength={8}
                  maxLength={32} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Confirm Password</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Confirm Password"
                  minLength={8}
                  maxLength={32}
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-red-500 mt-2">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !email || !password || !passwordConfirmation || password !== passwordConfirmation}
                onClick={async (e) => {
                  e.preventDefault();
                  try {
                    // Basic client-side validation
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                      throw new Error('Please enter a valid email address');
                    }

                    if (password !== passwordConfirmation) {
                      throw new Error('Passwords do not match');
                    }

                    if (password.length < 8) {
                      throw new Error('Password must be at least 8 characters');
                    }

                    const result = await signup.mutateAsync({
                      email,
                      password,
                      name: userName
                    });
                    
                    if (!result.error) {
                      router.push('/');
                    }
                  } catch (err) {
                    console.error('Signup error:', err);
                  }
                }}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Create an account"
                )}
              </Button>
              <Button variant="outline" className="w-full">
                Sign Up with Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login">
                <span className="underline underline-offset-4">Log in</span>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div >
  );
};

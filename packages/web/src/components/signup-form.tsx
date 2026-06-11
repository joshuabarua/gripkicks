"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { signUp, signIn } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { motion } from "framer-motion";
import { GoogleIcon } from '@/components/GoogleIcon';
import { analyticsEvents, identify, track } from "@/lib/analytics";

const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name must be less than 50 characters"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name must be less than 50 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedCallbackUrl = searchParams.get("callbackUrl");
  const callbackUrl = new URL(
    requestedCallbackUrl?.startsWith("/") ? requestedCallbackUrl : "/onboarding",
    typeof window !== "undefined" ? window.location.origin : "",
  ).toString();
  const loginHref = requestedCallbackUrl
    ? `/auth/login?callbackUrl=${encodeURIComponent(requestedCallbackUrl)}`
    : "/auth/login";

  const inputClasses =
    "bg-black border-white/[0.06] text-brand-chalk placeholder:text-brand-putty/30 focus:border-brand-red focus:ring-brand-red rounded-none h-12";

  return (
    <div className="space-y-6">
      <div className="bg-brand-surface border border-white/[0.06] p-8 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="first-name"
              className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-400"
            >
              First name
            </Label>
            <Input
              id="first-name"
              placeholder="John"
              required
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
              className={inputClasses}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="last-name"
              className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-400"
            >
              Last name
            </Label>
            <Input
              id="last-name"
              placeholder="Doe"
              required
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
              className={inputClasses}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-400"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="johndoe@example.com"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
            className={inputClasses}
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-400"
          >
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Min 8 characters"
            minLength={8}
            className={inputClasses}
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="password_confirmation"
            className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-400"
          >
            Confirm password
          </Label>
          <Input
            id="password_confirmation"
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            autoComplete="new-password"
            placeholder="Confirm password"
            minLength={8}
            className={inputClasses}
          />
        </div>
        {error && (
          <div className="text-red-400 text-sm font-sora bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            {error}
          </div>
        )}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={loading}
          onClick={async (e) => {
            e.preventDefault();
            setError(null);

            const formData: SignupFormData = {
              firstName,
              lastName,
              email,
              password,
              passwordConfirmation,
            };
            const validationResult = signupSchema.safeParse(formData);
            if (!validationResult.success) {
              const firstIssue = validationResult.error.issues.at(0);
              const message = firstIssue?.message ?? "Invalid signup form";
              setError(message);
              track(analyticsEvents.signupFailed, {
                method: "email",
                reason: message,
              });
              return;
            }

            track(analyticsEvents.signupStarted, { method: "email" });

            await signUp.email({
              email,
              password,
              name: `${firstName} ${lastName}`,
              callbackURL: callbackUrl,
              fetchOptions: {
                onRequest: () => {
                  setLoading(true);
                },
                onResponse: () => {
                  setLoading(false);
                },
                onError: (ctx) => {
                  setError(ctx.error.message);
                  track(analyticsEvents.signupFailed, {
                    method: "email",
                    reason: ctx.error.message,
                  });
                },
                onSuccess: () => {
                  track(analyticsEvents.signupSucceeded, { method: "email" });
                  identify(email, {
                    email,
                    signup_method: "email",
                  });
                  router.replace(callbackUrl);
                },
              },
            });
          }}
          className="w-full bg-brand-red hover:bg-brand-red/80 disabled:opacity-50 text-black font-ball-pill text-lg py-3 transition-colors duration-500 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            "CREATE ACCOUNT"
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={loading}
          onClick={async () => {
            setError(null);
            track(analyticsEvents.signupStarted, { method: "google" });
            await signIn.social({
              provider: "google",
              callbackURL: callbackUrl,
              errorCallbackURL: new URL("/auth/signup?error=oauth", typeof window !== "undefined" ? window.location.origin : "").toString(),
              fetchOptions: {
                onRequest: () => {
                  setLoading(true);
                },
                onResponse: () => {
                  setLoading(false);
                },
                onError: (ctx) => {
                  const message =
                    ctx.error.message ||
                    "Google sign-up is currently unavailable. Try email for now.";
                  setError(message);
                  track(analyticsEvents.signupFailed, {
                    method: "google",
                    reason: message,
                  });
                },
              },
            });
          }}
          className="w-full border border-white/[0.06] hover:border-brand-red/30 text-brand-chalk font-sora text-sm py-3 transition-all duration-500 flex items-center justify-center gap-3"
        >
          <GoogleIcon />
          Sign up with Google
        </motion.button>
      </div>
      <div className="text-center">
        <span className="font-sora text-sm text-neutral-500">
          Already have an account?{" "}
          <Link
            href={loginHref}
            className="text-brand-red hover:text-white transition-colors duration-500"
          >
            Log in
          </Link>
        </span>
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { signIn, safeCallbackPath } from "@/lib/auth";
import { useState } from "react";
import { motion } from 'framer-motion';
import { GoogleIcon } from '@/components/GoogleIcon';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestedCallbackUrl = searchParams.get("callbackUrl");
  const callbackUrl = safeCallbackPath(requestedCallbackUrl);
  const signupHref = requestedCallbackUrl
    ? `/auth/signup?callbackUrl=${encodeURIComponent(requestedCallbackUrl)}`
    : "/auth/signup";

  return (
    <div className="space-y-6">
      <div className="lab-card p-fluid-xl space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="lab-label font-mono"
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
            className="rounded-lg bg-black border border-white/6 text-brand-chalk placeholder:text-brand-putty/30 h-12 focus:border-brand-red focus:ring-brand-red"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="lab-label font-mono"
            >
              Password
            </Label>
            <Link
              href="/auth/reset-password"
              className="font-mono text-xs text-brand-putty/40 hover:text-brand-putty transition-colors duration-500"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="password"
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
            className="rounded-lg bg-black border border-white/6 text-brand-chalk placeholder:text-brand-putty/30 h-12 focus:border-brand-red focus:ring-brand-red"
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            className="border-white/10 data-[state=checked]:bg-brand-red data-[state=checked]:border-brand-red"
          />
          <Label
            htmlFor="rememberMe"
            className="font-mono text-sm text-brand-putty"
          >
            Remember me
          </Label>
        </div>
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 font-mono text-sm text-red-400">
            {error}
          </div>
        )}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={loading}
          onClick={async () => {
            setError(null);
            await signIn.email({
              email,
              password,
              rememberMe,
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
                },
                onSuccess: () => {
                  router.replace(callbackUrl);
                },
              },
            });
          }}
          className="lab-button w-full"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : "LOGIN"}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={loading}
          onClick={async () => {
            setError(null);
            await signIn.social({
              provider: "google",
              callbackURL: new URL(callbackUrl, window.location.origin).toString(),
              errorCallbackURL: new URL(
                "/auth/login?error=oauth",
                window.location.origin,
              ).toString(),
              fetchOptions: {
                onRequest: () => {
                  setLoading(true);
                },
                onResponse: () => {
                  setLoading(false);
                },
                onError: (ctx) => {
                  setError(
                    ctx.error.message ||
                      "Google login is currently unavailable.",
                  );
                },
              },
            });
          }}
          className="lab-button-ghost w-full"
        >
          <GoogleIcon />
          Sign in with Google
        </motion.button>
      </div>
      <div className="text-center">
        <span className="font-mono text-sm text-brand-putty/50">
          Don&apos;t have an account?{" "}
          <Link
            href={signupHref}
            className="text-brand-chalk underline decoration-brand-red underline-offset-4 transition-colors duration-500 hover:decoration-brand-chalk"
          >
            Sign up
          </Link>
        </span>
      </div>
    </div>
  );
}

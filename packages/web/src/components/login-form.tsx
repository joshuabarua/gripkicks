"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { signIn } from "@/lib/auth";
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
  const callbackUrl = requestedCallbackUrl?.startsWith("/")
    ? requestedCallbackUrl
    : "/dashboard";
  const signupHref = requestedCallbackUrl
    ? `/auth/signup?callbackUrl=${encodeURIComponent(requestedCallbackUrl)}`
    : "/auth/signup";

  return (
    <div className="space-y-6">
      <div className="bg-brand-surface border border-white/6 p-8 space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400"
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
            className="bg-black border-white/6 text-brand-chalk placeholder:text-brand-putty/30 focus:border-brand-red focus:ring-brand-red rounded-none h-12"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400"
            >
              Password
            </Label>
            <Link
              href="/auth/reset-password"
              className="font-mono text-xs text-brand-putty/40 hover:text-brand-red transition-colors duration-500"
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
            className="bg-black border-white/6 text-brand-chalk placeholder:text-brand-putty/30 focus:border-brand-red focus:ring-brand-red rounded-none h-12"
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
            className="font-mono text-sm text-neutral-400"
          >
            Remember me
          </Label>
        </div>
        {error && (
          <div className="text-red-400 text-sm font-mono bg-red-500/10 border border-red-500/20 rounded-xl p-3">
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
          className="w-full bg-brand-red hover:bg-brand-red/80 disabled:opacity-50 text-black font-ball-pill text-lg py-3 transition-colors duration-500 flex items-center justify-center gap-2"
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
          className="w-full border border-white/6 hover:border-brand-red/30 text-brand-chalk font-mono text-sm py-3 transition-all duration-500 flex items-center justify-center gap-3"
        >
          <GoogleIcon />
          Sign in with Google
        </motion.button>
      </div>
      <div className="text-center">
        <span className="font-mono text-sm text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link
            href={signupHref}
            className="text-brand-red hover:text-white transition-colors duration-500"
          >
            Sign up
          </Link>
        </span>
      </div>
    </div>
  );
}

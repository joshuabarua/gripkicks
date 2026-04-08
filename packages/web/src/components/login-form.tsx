"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { signIn } from "@/lib/auth";
import { useState } from "react";
import { motion } from "framer-motion";

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
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 space-y-5">
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
            className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-orange-500 focus:ring-orange-500 rounded-xl h-12"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-400"
            >
              Password
            </Label>
            <Link
              href="/auth/reset-password"
              className="font-sora text-xs text-neutral-500 hover:text-orange-500 transition-colors"
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
            className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-orange-500 focus:ring-orange-500 rounded-xl h-12"
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            className="border-neutral-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
          />
          <Label
            htmlFor="rememberMe"
            className="font-sora text-sm text-neutral-400"
          >
            Remember me
          </Label>
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
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black font-tanker text-lg py-3 rounded-2xl transition-colors flex items-center justify-center gap-2"
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
              callbackURL: callbackUrl,
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
                      "Google sign-in is currently unavailable.",
                  );
                },
              },
            });
          }}
          className="w-full border border-neutral-700 hover:border-orange-500/30 text-white font-sora text-sm py-3 rounded-2xl transition-all flex items-center justify-center gap-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 256 262"
          >
            <path
              fill="#4285F4"
              d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
            ></path>
            <path
              fill="#34A853"
              d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
            ></path>
            <path
              fill="#FBBC05"
              d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
            ></path>
            <path
              fill="#EB4335"
              d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
            ></path>
          </svg>
          Sign in with Google
        </motion.button>
      </div>
      <div className="text-center">
        <span className="font-sora text-sm text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link
            href={signupHref}
            className="text-orange-500 hover:text-orange-400 transition-colors"
          >
            Sign up
          </Link>
        </span>
      </div>
    </div>
  );
}

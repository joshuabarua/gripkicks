'use client'

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { signUp, signIn } from "@/lib/auth";
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { motion } from "framer-motion";

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  passwordConfirmation: z.string(),
}).refine((data) => data.password === data.passwordConfirmation, {
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

  const inputClasses = "bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-orange-500 focus:ring-orange-500 rounded-xl h-12";

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name" className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[FIRST_NAME]</Label>
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
            <Label htmlFor="last-name" className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[LAST_NAME]</Label>
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
          <Label htmlFor="email" className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[EMAIL]</Label>
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
          <Label htmlFor="password" className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[PASSWORD]</Label>
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
          <Label htmlFor="password_confirmation" className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[CONFIRM]</Label>
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
          <div className="text-red-400 text-sm font-sora bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</div>
        )}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={loading}
          onClick={async (e) => {
            e.preventDefault();
            setError(null);
            
            const formData: SignupFormData = { firstName, lastName, email, password, passwordConfirmation };
            const validationResult = signupSchema.safeParse(formData);
            if (!validationResult.success) {
              setError(validationResult.error.issues[0].message);
              return;
            }
            
            await signUp.email({
              email,
              password,
              name: `${firstName} ${lastName}`,
              callbackURL: "/",
              fetchOptions: {
                onRequest: () => { setLoading(true); },
                onResponse: () => { setLoading(false); },
                onError: (ctx) => { setError(ctx.error.message); },
                onSuccess: () => { router.push("/onboarding"); },
              },
            });
          }}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black font-tanker text-lg py-3 rounded-2xl transition-colors flex items-center justify-center gap-2"
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
            await signIn.social({
              provider: "google",
              callbackURL: "/onboarding",
              fetchOptions: {
                onRequest: () => { setLoading(true); },
                onResponse: () => { setLoading(false); },
              },
            });
          }}
          className="w-full border border-neutral-700 hover:border-orange-500/30 text-white font-sora text-sm py-3 rounded-2xl transition-all flex items-center justify-center gap-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 262">
            <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
            <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
            <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"></path>
            <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
          </svg>
          Sign up with Google
        </motion.button>
      </div>
      <div className="text-center">
        <span className="font-sora text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-orange-500 hover:text-orange-400 transition-colors">
            Log in
          </Link>
        </span>
      </div>
    </div>
  );
}

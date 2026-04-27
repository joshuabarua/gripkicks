"use client";

import { motion } from "framer-motion";
import { CheckCircle, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { analyticsEvents, track } from "@/lib/analytics";

function SuccessContent() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get("checkout_id");

  useEffect(() => {
    track(analyticsEvents.checkoutSucceeded, {
      checkout_id: checkoutId || undefined,
    });
  }, [checkoutId]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle className="w-10 h-10 text-brand-red" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30 mb-4">
            Welcome to GripKicks
          </p>
          <h1 className="font-ball-pill text-5xl md:text-6xl mb-4">
            YOU&apos;RE <span className="text-brand-red">IN</span>
          </h1>
          <p className="font-sora text-neutral-400 text-lg mb-2">
            Your account is all set.
          </p>
          <p className="font-sora text-neutral-600 text-sm mb-10">
            Every feature is unlocked and free. Start building your shoe
            collection and finding your perfect fit.
          </p>

          {checkoutId && (
            <p className="font-sora text-[10px] text-neutral-700 mb-8">
              Ref: {checkoutId}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/matcher">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-brand-red hover:bg-brand-red/80 text-black font-ball-pill text-lg px-8 py-3 rounded-2xl transition-colors inline-flex items-center gap-2"
              >
                FIND YOUR SOLE MATE
                <ArrowUpRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="border border-neutral-700 hover:border-brand-red/30 text-neutral-400 hover:text-white font-sora px-8 py-3 rounded-2xl transition-all"
              >
                Go to Dashboard
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default function PricingSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="font-sora text-neutral-500 text-sm">Loading…</div>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

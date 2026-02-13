'use client';

import { motion } from 'framer-motion';
import { CheckCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get('checkout_id');

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle className="w-10 h-10 text-orange-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="font-mono text-[10px] text-orange-500 tracking-[0.3em] mb-4">[WELCOME_TO_PREMIUM]</p>
          <h1 className="font-tanker text-5xl md:text-6xl mb-4">
            YOU&apos;RE <span className="text-orange-500">IN</span>
          </h1>
          <p className="font-sora text-neutral-400 text-lg mb-2">
            Premium features are now unlocked.
          </p>
          <p className="font-sora text-neutral-600 text-sm mb-10">
            Full recommendations, Sole Mate matching, and early access to new features are all yours.
          </p>

          {checkoutId && (
            <p className="font-mono text-[10px] text-neutral-700 mb-8">
              Checkout ID: {checkoutId}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/findmyshoe">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-orange-500 hover:bg-orange-600 text-black font-tanker text-lg px-8 py-3 rounded-2xl transition-colors inline-flex items-center gap-2"
              >
                FIND YOUR SOLE MATE
                <ArrowUpRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="border border-neutral-700 hover:border-orange-500/30 text-neutral-400 hover:text-white font-sora px-8 py-3 rounded-2xl transition-all"
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
    <Suspense fallback={
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="font-mono text-neutral-500 text-sm">[LOADING...]</div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}

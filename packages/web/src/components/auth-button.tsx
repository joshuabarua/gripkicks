'use client';

import Link from 'next/link';

export default function AuthButton() {
  return (
    <Link
      href="/auth/login"
      className="inline-flex h-8 items-center justify-center rounded-sm border border-brand-red/20 bg-brand-red/10 px-3 font-sora text-[10px] uppercase tracking-[0.2em] text-brand-red transition-all duration-500 hover:border-brand-red/40 hover:bg-brand-red hover:text-black"
    >
      Sign In
    </Link>
  );
}

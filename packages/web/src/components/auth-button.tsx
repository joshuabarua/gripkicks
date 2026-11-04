'use client';

import Link from '@/components/ui/NavLink';

export default function AuthButton() {
  return (
    <Link
      href="/auth/login"
      className="inline-flex h-8 items-center justify-center rounded-sm border border-brand-red/40 bg-transparent px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white transition-all duration-500 hover:border-brand-red hover:bg-brand-red hover:text-black"
    >
      Sign In
    </Link>
  );
}

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const footerLinks = {
  product: [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Foot Lab', href: '/footchecker' },
    { title: 'Shoe Sanctuary', href: '/stash' },
    { title: 'Sole Mate', href: '/findmyshoe' },
  ],
  company: [
    { title: 'About', href: '/about' },
    { title: 'Privacy', href: '/privacy' },
    { title: 'Pricing', href: '/pricing' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="md:col-span-2">
            <Link href="/">
              <h2 className="font-tanker text-3xl text-white mb-3">
                GRIP <span className="text-orange-500">KICKS</span>
              </h2>
            </Link>
            <p className="font-sora text-sm text-neutral-500 max-w-xs leading-relaxed">
              Community-driven climbing shoe recommendations. Built by climbers, for climbers. No AI, no gimmicks.
            </p>
          </div>

          <div>
            <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em] mb-4">[PRODUCT]</p>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-sora text-sm text-neutral-500 hover:text-orange-500 transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em] mb-4">[COMPANY]</p>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-sora text-sm text-neutral-500 hover:text-orange-500 transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sora text-xs text-neutral-700">
            &copy; {new Date().getFullYear()} GripKicks. Your data, your shoes.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="font-sora text-xs text-neutral-700 hover:text-orange-500 transition-colors">
              Privacy
            </Link>
            <Link href="/about" className="font-sora text-xs text-neutral-700 hover:text-orange-500 transition-colors">
              About
            </Link>
          </div>
        </div>
      </div>

      <motion.div
        className="h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: 'left' }}
      />
    </footer>
  );
}
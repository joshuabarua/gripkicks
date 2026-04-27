"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FooterGrippy } from "./GrippyKickkyy";

const footerLinks = {
  product: [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Foot Lab", href: "/footscan" },
    { title: "Sanctuary", href: "/stash" },
    { title: "Matcher", href: "/matcher" },
  ],
  company: [
    { title: "About", href: "/about" },
    { title: "Privacy", href: "/privacy" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="md:col-span-2">
            <Link href="/">
              <h2 className="font-ball-pill text-3xl text-brand-chalk mb-3">
                GRIP <span className="text-brand-red">KICKS</span>
              </h2>
            </Link>
          </div>

          <div>
            <p className="font-sora text-[9px] uppercase tracking-[0.35em] text-brand-putty/30 mb-4">Product</p>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sora text-sm text-brand-putty/50 hover:text-brand-red transition-colors duration-500"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-sora text-[9px] uppercase tracking-[0.35em] text-brand-putty/30 mb-4">Company</p>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sora text-sm text-brand-putty/50 hover:text-brand-red transition-colors duration-500"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sora text-xs text-brand-putty/25">
            &copy; {new Date().getFullYear()} GripKicks. Your data, your shoes.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="font-sora text-xs text-brand-putty/25 hover:text-brand-red transition-colors duration-500"
            >
              Privacy
            </Link>
            <Link
              href="/about"
              className="font-sora text-xs text-brand-putty/25 hover:text-brand-red transition-colors duration-500"
            >
              About
            </Link>
          </div>
        </div>
      </div>

      <motion.div
        className="h-px bg-brand-red/40"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "left" }}
      />
      <FooterGrippy />
    </footer>
  );
}

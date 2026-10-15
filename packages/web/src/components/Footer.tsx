"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FooterGrippy } from "./GrippyKickkyy";

const footerLinks = {
  product: [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Foot Lab", href: "/footlab" },
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
    <footer className="bg-brand-surface border-t border-white/20 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="md:col-span-2">
            <Link href="/">
              <h2 className="font-ball-pill text-3xl text-brand-chalk mb-3">
                GRIPKICKS
              </h2>
            </Link>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-brand-putty/90 mb-4">Product</p>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-mono text-sm text-brand-putty/90 hover:text-brand-chalk transition-colors duration-500"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-brand-putty/90 mb-4">Company</p>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-mono text-sm text-brand-putty/90 hover:text-brand-chalk transition-colors duration-500"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-white/20 pt-8 text-center md:text-left">
          <p className="font-mono text-xs text-brand-putty/85">
            &copy; {new Date().getFullYear()} GripKicks
          </p>
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

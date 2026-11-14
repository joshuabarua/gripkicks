import { motion } from "framer-motion";
import Link from "@/components/ui/NavLink";

interface CompleteStepProps {
  onFinish: () => void;
}

export function CompleteStep({ onFinish }: CompleteStepProps) {
  return (
    <div className="text-center">
      <h1 className="lab-title text-fluid-4xl mb-10">
        ALL SET
      </h1>

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {[
          {
            href: "/footlab",
            label: "Foot Lab",
          },
          { href: "/stash", label: "My Shoes" },
          { href: "/matcher", label: "Matcher" },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="lab-card p-6 flex flex-col items-center gap-3 cursor-pointer"
            >
              <span className="font-mono text-lg text-brand-chalk">
                {item.label}
              </span>
            </motion.div>
          </Link>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onFinish}
        className="lab-button w-full"
      >
        GO TO SHOE SANCTUARY
      </motion.button>
    </div>
  );
}

import Link from "@/components/ui/NavLink";
import { LabHeader } from "@/components/ui/LabHeader";

const VARIATIONS = [
  { href: "/", label: "Production" },
  { href: "/test/cyber-kinetic", label: "Cyber-Kinetic" },
  { href: "/test/soft-minimal", label: "Soft Minimal" },
  { href: "/test/editorial-japanese", label: "Japanese" },
  { href: "/test/editorial-retro", label: "Retro" },
  { href: "/test/editorial-gorp", label: "Gorpcore" },
  { href: "/test/matcher-preview", label: "Matcher Preview" },
  { href: "/test/dashboard-preview", label: "Dashboard Preview" },
];

export default function HomeDesignsIndex() {
  return (
    <main className="min-h-screen bg-black text-white font-mono">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <LabHeader title="Design Previews" description="Development only." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
          {VARIATIONS.map((v) => (
            <Link key={v.href} href={v.href} className="lab-card block p-6">
              <span className="lab-label">{v.href}</span>
              <h2 className="lab-title text-xl mt-2">{v.label}</h2>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

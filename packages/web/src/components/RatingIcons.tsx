import { Feather, Shield, Zap } from "lucide-react";

interface RatingIconsProps {
  comfort?: number | undefined;
  performance?: number | undefined;
  durability?: number | undefined;
  max?: number;
  className?: string;
}

export function RatingIcons({ comfort, performance, durability, max = 10, className = "" }: RatingIconsProps) {
  const items = [
    { label: "Comfort", icon: Feather, value: comfort },
    { label: "Performance", icon: Zap, value: performance },
    { label: "Durability", icon: Shield, value: durability },
  ] as const;

  return (
    <div className={`flex items-center gap-fluid-md ${className}`}>
      {items.map(({ label, icon: Icon, value }) => (
        <span key={label} title={label} className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.14em] text-brand-putty/85">
          <Icon aria-hidden="true" className="h-3.5 w-3.5 text-brand-chalk/70" />
          <span className="tabular-nums">{value !== undefined ? `${Number.isInteger(value) ? value : value.toFixed(1)}/${max}` : `—/${max}`}</span>
        </span>
      ))}
    </div>
  );
}

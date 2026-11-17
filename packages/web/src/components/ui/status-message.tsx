import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusTone = "danger" | "warning" | "success" | "info";

const TONES: Record<StatusTone, { icon: typeof AlertCircle; frame: string; iconClass: string }> = {
  danger: { icon: AlertCircle, frame: "border-status-danger/40 bg-status-danger/10", iconClass: "text-status-danger" },
  warning: { icon: AlertTriangle, frame: "border-status-warning/40 bg-status-warning/10", iconClass: "text-status-warning" },
  success: { icon: CheckCircle2, frame: "border-status-success/40 bg-status-success/10", iconClass: "text-status-success" },
  info: { icon: Info, frame: "border-status-info/40 bg-status-info/10", iconClass: "text-status-info" },
};

interface StatusMessageProps {
  tone: StatusTone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function StatusMessage({ tone, title, children, className }: StatusMessageProps) {
  const { icon: Icon, frame, iconClass } = TONES[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-lg border p-3 font-mono text-sm text-brand-chalk", frame, className)}
    >
      <Icon aria-hidden="true" className={cn("mt-0.5 h-4 w-4 shrink-0", iconClass)} />
      <div className="min-w-0">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={cn(title && "mt-1 text-brand-putty")}>{children}</div>}
      </div>
    </div>
  );
}

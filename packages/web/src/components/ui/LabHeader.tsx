import type { ReactNode } from "react";

export function LabHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="lab-rise mb-fluid-2xl flex flex-col gap-fluid-lg md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-ball-pill text-6xl md:text-8xl leading-none uppercase">{title}</h1>
        {description && (
          <p className="mt-4 max-w-lg font-mono text-base text-neutral-400 md:text-lg">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

import type { ReactNode } from "react";

export function LabHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="lab-rise mb-fluid-2xl flex flex-col gap-fluid-lg md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-amatic text-fluid-8xl leading-none uppercase">{title}</h1>
        {description && (
          <p className="mt-4 max-w-lg font-mono text-fluid-lg text-brand-putty">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

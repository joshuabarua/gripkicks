"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Building blocks for "tap the value, pick from a grid, grid closes" fields.

interface PickerValueButtonProps {
  open: boolean;
  controls: string;
  /** Full spoken label, e.g. "Size: EU 40". */
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export function PickerValueButton({ open, controls, label, onClick, disabled, className, children }: PickerValueButtonProps) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "min-h-9 min-w-16 rounded-md border px-3 font-mono text-sm tabular-nums text-brand-chalk transition-colors duration-300 disabled:cursor-default disabled:opacity-60",
        open ? "border-brand-red bg-brand-red/15" : "border-white/15 hover:border-white/40",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function PickerPanel({ id, onClose, className, children }: { id: string; onClose: () => void; className?: string; children: ReactNode }) {
  return (
    <div
      id={id}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        // Close just the grid, not whatever card or dialog it sits in.
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
      className={cn("lab-rise space-y-3 rounded-lg border border-white/15 bg-black/30 p-3", className)}
    >
      {children}
    </div>
  );
}

export function PickerOption({ selected, label, onSelect, children }: { selected: boolean; label: string; onSelect: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      onClick={onSelect}
      className={cn(
        "min-h-10 rounded-md border px-1 font-mono text-sm tabular-nums transition-colors duration-300",
        selected ? "border-brand-red bg-brand-red/15 text-brand-chalk" : "border-white/15 text-brand-putty hover:border-white/40 hover:text-brand-chalk",
      )}
    >
      {children}
    </button>
  );
}

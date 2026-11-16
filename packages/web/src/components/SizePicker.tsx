"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { SIZE_SYSTEMS, SIZE_SYSTEM_STORAGE_KEY, SIZES, parseSize, sizeValue, type SizeSystem } from "@/constants/shoe-sizes";
import { cn } from "@/lib/utils";

function readStoredSystem(): SizeSystem | null {
  try {
    const stored = window.localStorage.getItem(SIZE_SYSTEM_STORAGE_KEY);
    return SIZE_SYSTEMS.includes(stored as SizeSystem) ? (stored as SizeSystem) : null;
  } catch {
    return null;
  }
}

const subscribeNoop = () => () => undefined;

function storeSystem(system: SizeSystem) {
  try {
    window.localStorage.setItem(SIZE_SYSTEM_STORAGE_KEY, system);
  } catch {
    return;
  }
}

interface SizePickerProps {
  value: string | null | undefined;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export function SizePicker({ value, onChange, label = "Size", className }: SizePickerProps) {
  const parsed = parseSize(value);
  const stored = useSyncExternalStore(subscribeNoop, readStoredSystem, () => null);
  const [chosen, setChosen] = useState<SizeSystem | null>(null);
  const system = chosen ?? parsed?.system ?? stored ?? "EU";
  const labelId = useId();
  const rowRef = useRef<HTMLDivElement>(null);

  const selected = parsed?.system === system ? parsed.size : null;

  useEffect(() => {
    const row = rowRef.current;
    const chip = row?.querySelector<HTMLElement>('[aria-checked="true"]') ?? row?.querySelector<HTMLElement>('[data-anchor="true"]');
    if (!row || !chip) return;
    row.scrollLeft = chip.offsetLeft - row.clientWidth / 2 + chip.clientWidth / 2;
  }, [system, selected]);

  const anchor = system === "EU" ? "40" : system === "US" ? "8" : "7";

  return (
    <div className={cn("min-w-0 space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <span id={labelId} className="font-mono text-[11px] uppercase tracking-[0.13em] text-brand-putty/85">{label}</span>
        <div role="radiogroup" aria-label="Size system" className="flex rounded-md border border-white/15 p-0.5">
          {SIZE_SYSTEMS.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={system === option}
              onClick={() => {
                setChosen(option);
                storeSystem(option);
              }}
              className={cn(
                "min-h-7 rounded-sm px-2.5 font-mono text-[11px] uppercase tracking-wider transition-colors duration-300",
                system === option ? "bg-brand-red/15 text-brand-chalk ring-1 ring-brand-red/40" : "text-brand-putty hover:text-brand-chalk",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={rowRef}
        role="radiogroup"
        aria-labelledby={labelId}
        className="flex snap-x gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]"
      >
        {SIZES[system].map((size) => {
          const isSelected = selected === size;
          return (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${system} ${size}`}
              data-anchor={size === anchor || undefined}
              onClick={() => onChange(sizeValue(system, size))}
              className={cn(
                "min-h-10 min-w-12 shrink-0 snap-center rounded-md border px-2 font-mono text-sm tabular-nums transition-colors duration-300",
                isSelected ? "border-brand-red bg-brand-red/15 text-brand-chalk" : "border-white/15 text-brand-putty hover:border-white/30 hover:text-brand-chalk",
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
      {value && !parsed && <p className="font-mono text-xs text-brand-putty">Saved: {value}</p>}
    </div>
  );
}

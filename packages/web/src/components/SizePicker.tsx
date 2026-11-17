"use client";

import { useId, useState, useSyncExternalStore } from "react";
import { SIZE_SYSTEMS, SIZE_SYSTEM_STORAGE_KEY, SIZES, parseSize, sizeValue, type SizeSystem } from "@/constants/shoe-sizes";
import { cn } from "@/lib/utils";
import { PickerOption, PickerPanel, PickerValueButton } from "@/components/ui/GridPicker";

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
  /** Start with the grid showing, for forms where a size still has to be chosen. */
  defaultOpen?: boolean;
  /** Pass both to control the grid from outside, e.g. to keep one picker open at a time. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Shows the saved size as a button; tapping it opens a grid of sizes that
// closes again once one is picked.
export function SizePicker({ value, onChange, label = "Size", className, defaultOpen = false, open, onOpenChange }: SizePickerProps) {
  const parsed = parseSize(value);
  const stored = useSyncExternalStore(subscribeNoop, readStoredSystem, () => null);
  const [chosen, setChosen] = useState<SizeSystem | null>(null);
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const isOpen = open ?? localOpen;
  const setOpen = (next: boolean) => {
    setLocalOpen(next);
    onOpenChange?.(next);
  };
  const system = chosen ?? parsed?.system ?? stored ?? "EU";
  const labelId = useId();
  const panelId = useId();
  const selected = parsed?.system === system ? parsed.size : null;

  return (
    <div className={cn("min-w-0 space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <span id={labelId} className="font-mono text-[11px] uppercase tracking-[0.13em] text-brand-putty/85">{label}</span>
        <PickerValueButton open={isOpen} controls={panelId} label={`${label}: ${value?.trim() ? (parsed ? sizeValue(parsed.system, parsed.size) : value) : "not set"}`} onClick={() => setOpen(!isOpen)}>
          {parsed ? sizeValue(parsed.system, parsed.size) : value?.trim() || "Select"}
        </PickerValueButton>
      </div>
      {isOpen && (
        <PickerPanel id={panelId} onClose={() => setOpen(false)}>
          <div role="radiogroup" aria-label="Size system" className="flex w-fit rounded-md border border-white/15 p-0.5">
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
          <div role="radiogroup" aria-labelledby={labelId} className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1.5">
            {SIZES[system].map((size) => (
              <PickerOption
                key={size}
                selected={selected === size}
                label={`${system} ${size}`}
                onSelect={() => {
                  onChange(sizeValue(system, size));
                  setOpen(false);
                }}
              >
                {size}
              </PickerOption>
            ))}
          </div>
        </PickerPanel>
      )}
    </div>
  );
}

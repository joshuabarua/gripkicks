"use client";

import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { UserShoe } from "@/types/api";

interface RemoveShoeDialogProps {
  shoe: UserShoe | null;
  onCancel: () => void;
  onConfirm: (shoe: UserShoe) => void;
}

export function RemoveShoeDialog({ shoe, onCancel, onConfirm }: RemoveShoeDialogProps) {
  const details = shoe?.shoe ?? shoe?.shoeDetails;
  const label = details ? `${details.brand} ${details.name}` : "this shoe";

  return (
    <Dialog open={shoe !== null} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="max-w-md rounded-3xl border border-neutral-800 bg-neutral-950 text-white shadow-2xl shadow-brand-red/5">
        <DialogHeader>
          <DialogTitle className="text-center font-so-cloudy text-fluid-2xl uppercase text-white">Remove shoe?</DialogTitle>
          <DialogDescription className="text-center font-mono text-fluid-sm text-neutral-400">
            {label} and its ratings will be removed from your sanctuary.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button type="button" autoFocus onClick={onCancel} className="lab-button-ghost">
            Keep it
          </button>
          <button type="button" onClick={() => shoe && onConfirm(shoe)} className="lab-button text-xs">
            <Trash2 aria-hidden="true" className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

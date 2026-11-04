'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Save, HelpCircle, ChevronDown, Trash2 } from 'lucide-react';
import { shoeSizes, conditions, type ShoeSizeOption } from '@/constants/shoe-data';
import type { UserShoe } from '@/types/api';
import type { EditFormData } from '@/schemas/shoe-schema';

interface EditShoeDialogProps {
  editingShoe: UserShoe | null;
  editForm: EditFormData;
  setEditForm: (form: EditFormData) => void;
  setEditingShoe: (shoe: UserShoe | null) => void;
  updateShoeStats: () => void;
  removeShoe?: (() => void) | undefined;
}

export default function EditShoeDialog({
  editingShoe,
  editForm,
  setEditForm,
  setEditingShoe,
  updateShoeStats,
  removeShoe,
}: EditShoeDialogProps) {
  return (
    <AnimatePresence>
      {editingShoe && (
        <Dialog open={!!editingShoe} onOpenChange={() => setEditingShoe(null)}>
          <DialogContent className="bg-neutral-950 text-white border border-white/6 w-[min(96vw,56rem)] max-w-4xl max-h-[90dvh] flex flex-col rounded-lg hal-glow shadow-2xl p-0 overflow-hidden">
            <DialogHeader className="relative min-h-22 space-y-3 border-b border-white/6 px-5 py-6 pr-38 sm:px-8 sm:py-7 sm:pr-48">
              <DialogTitle className="text-white font-so-cloudy uppercase text-fluid-xl">Edit Shoe Stats</DialogTitle>
              <DialogDescription className="text-fluid-sm text-neutral-500 font-mono">
                {(editingShoe.shoe?.name || editingShoe.shoeDetails?.name || 'Unknown Shoe')}, {(editingShoe.shoe?.brand || editingShoe.shoeDetails?.brand || 'Unknown Brand')}
              </DialogDescription>
              <div className="absolute right-4 top-4 flex items-center gap-2">
                {removeShoe && (
                  <Button
                    variant="destructive"
                    aria-label="Remove shoe"
                    onClick={removeShoe}
                    className="h-11 w-11 shrink-0 border border-red-500/20 bg-red-900/30 p-0 text-red-400 hover:bg-red-900/50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  aria-label="Save shoe changes"
                  className="min-h-11 shrink-0 bg-brand-red hover:bg-brand-red/80 text-black font-amatic rounded-lg px-4"
                  onClick={updateShoeStats}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-6 px-5 py-6 sm:space-y-8 sm:px-8 sm:py-8 overflow-y-auto flex-1 min-h-0">
              <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="size" className="text-neutral-400 font-mono text-xs">Size</Label>
                  <select
                    id="size"
                    value={editForm.size || ''}
                    onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-900 text-white border border-white/6 rounded-lg focus:border-brand-red/50 focus:outline-hidden focus:ring-1 focus:ring-brand-red/20 transition-colors"
                  >
                    <option value="">Select size</option>
                    {shoeSizes.map((size: ShoeSizeOption, index) => {
                      if ('separator' in size && size.separator) {
                        return (
                          <option key={`separator-${index}`} disabled className="text-neutral-600">
                            {size.label}
                          </option>
                        );
                      }
                      return (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition" className="text-neutral-400 font-mono text-xs">Condition</Label>
                  <select
                    id="condition"
                    value={editForm.condition || ''}
                    onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-900 text-white border border-white/6 rounded-lg focus:border-brand-red/50 focus:outline-hidden focus:ring-1 focus:ring-brand-red/20 transition-colors"
                  >
                    <option value="">Select condition</option>
                    {conditions.map((condition) => (
                      <option key={condition.value} value={condition.value}>
                        {condition.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchaseDate" className="text-neutral-400 font-mono text-xs">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={editForm.purchaseDate ? new Date(editForm.purchaseDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditForm({ ...editForm, purchaseDate: e.target.value })}
                    className="h-12 bg-neutral-900 text-white border-white/6 rounded-lg focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/20 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fitLongevity" className="text-neutral-400 font-mono text-xs">Fit Longevity</Label>
                  <select
                    id="fitLongevity"
                    value={editForm.fitLongevity || ''}
                    onChange={(e) => setEditForm({ ...editForm, fitLongevity: e.target.value || undefined })}
                    className="w-full px-4 py-3 bg-neutral-900 text-white border border-white/6 rounded-lg focus:border-brand-red/50 focus:outline-hidden focus:ring-1 focus:ring-brand-red/20 transition-colors"
                  >
                    <option value="">How long did the fit last?</option>
                    <option value="1-3 months">1 to 3 months</option>
                    <option value="3-6 months">3 to 6 months</option>
                    <option value="6+ months">6 months or more</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="sizingDeviation" className="text-neutral-400 font-mono text-xs">Sizing Deviation</Label>
                  <Input
                    id="sizingDeviation"
                    type="number"
                    step="0.5"
                    placeholder="e.g. -0.5 or +1.0"
                    value={editForm.sizingDeviation ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, sizingDeviation: e.target.value ? Number(e.target.value) : undefined })}
                    className="h-12 bg-neutral-900 text-white border-white/6 rounded-lg focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/20"
                  />
                  <p className="font-mono text-[11px] text-neutral-600">
                    Negative means you sized down from your normal shoe size, positive means you sized up.
                  </p>
                </div>

                <div className="rounded-lg border border-white/6 bg-brand-charcoal/60 p-4 sm:p-5 md:col-span-2">
                  <div className="mb-4 flex items-center gap-2">
                    <Label htmlFor="comfortScore" className="text-neutral-400 font-mono text-xs">Comfort (1-10)</Label>
                    <div className="group relative">
                      <HelpCircle className="w-3.5 h-3.5 text-neutral-600 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 text-xs text-neutral-300 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/6">
                        How comfortable this shoe feels for your feet
                      </div>
                    </div>
                  </div>
                  <RatingSlider
                    id="comfortScore"
                    value={editForm.comfortScore}
                    onChange={(value) => setEditForm({ ...editForm, comfortScore: value })}
                  />
                </div>

                <div className="rounded-lg border border-white/6 bg-brand-charcoal/60 p-4 sm:p-5 md:col-span-2">
                  <div className="mb-4 flex items-center gap-2">
                    <Label htmlFor="performanceRating" className="text-neutral-400 font-mono text-xs">Performance (1-10)</Label>
                    <div className="group relative">
                      <HelpCircle className="w-3.5 h-3.5 text-neutral-600 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 text-xs text-neutral-300 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/6">
                        Rate how this shoe performs for your climbing style
                      </div>
                    </div>
                  </div>
                  <RatingSlider
                    id="performanceRating"
                    value={editForm.performanceRating}
                    onChange={(value) => setEditForm({ ...editForm, performanceRating: value })}
                  />
                </div>

                <div className="rounded-lg border border-white/6 bg-brand-charcoal/60 p-4 sm:p-5 md:col-span-2">
                  <div className="mb-4 flex items-center gap-2">
                    <Label htmlFor="durabilityRating" className="text-neutral-400 font-mono text-xs">Durability (1-10)</Label>
                    <div className="group relative">
                      <HelpCircle className="w-3.5 h-3.5 text-neutral-600 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 text-xs text-neutral-300 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/6">
                        How well this shoe holds up over time
                      </div>
                    </div>
                  </div>
                  <RatingSlider
                    id="durabilityRating"
                    value={editForm.durabilityRating}
                    onChange={(value) => setEditForm({ ...editForm, durabilityRating: value })}
                  />
                </div>
              </div>

              <div className="border-t border-white/6 pt-2">
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, showNotes: !editForm.showNotes })}
                  className="flex items-center justify-between w-full py-3 text-sm text-neutral-300 hover:text-white transition-colors font-mono"
                >
                  <span>{editForm.showNotes ? 'Hide Additional Notes' : 'Add Additional Notes'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${editForm.showNotes ? 'rotate-180' : ''}`} />
                </button>
                {editForm.showNotes && (
                  <div className="pb-2 pt-2">
                    <Textarea
                      id="notes"
                      value={editForm.notes || ''}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      placeholder="Any additional notes about this shoe..."
                      rows={4}
                      className="bg-neutral-900 text-white placeholder:text-neutral-600 border-white/6 rounded-lg focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/20 resize-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

function RatingSlider({
  id,
  value,
  onChange,
}: {
  id: string;
  value?: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  const [draftValue, setDraftValue] = useState(5);
  const displayValue = value ?? draftValue;
  const isUnset = value === undefined;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
        <span>1</span>
        <span className="text-white font-medium">{isUnset ? 'Not rated yet' : `${displayValue}/10`}</span>
        <span>10</span>
      </div>
      <input
        id={id}
        type="range"
        min="1"
        max="10"
        step="1"
        value={displayValue}
        onChange={(e) => {
          const nextValue = Number.parseInt(e.target.value, 10);
          setDraftValue(nextValue);
          onChange(nextValue);
        }}
        className={`h-2 w-full cursor-pointer appearance-none rounded-full accent-brand-red transition-opacity ${isUnset ? 'bg-neutral-900 opacity-45' : 'bg-neutral-800 opacity-100'}`}
      />
      <button
        type="button"
        onClick={() => onChange(undefined)}
        className={`text-[11px] transition-colors ${isUnset ? 'text-neutral-700 hover:text-neutral-500' : 'text-neutral-500 hover:text-neutral-300'}`}
      >
        Clear rating
      </button>
    </div>
  );
}

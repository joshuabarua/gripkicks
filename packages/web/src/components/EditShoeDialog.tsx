'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  removeShoe?: () => void;
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
          <DialogContent className="bg-neutral-950 text-white border border-neutral-800 max-w-lg rounded-3xl shadow-2xl shadow-orange-500/5 p-fluid-lg space-y-fluid-md">
            <DialogHeader className="space-y-fluid-xs">
              <div className="flex items-center gap-fluid-sm">
                <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[EDIT_STATS]</p>
              </div>
              <DialogTitle className="text-white font-so-cloudy uppercase text-fluid-xl">Edit Shoe Stats</DialogTitle>
              <DialogDescription className="text-fluid-sm text-neutral-500 font-sora">
                {(editingShoe.shoe?.name || editingShoe.shoeDetails?.name || 'Unknown Shoe')} — {(editingShoe.shoe?.brand || editingShoe.shoeDetails?.brand || 'Unknown Brand')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-fluid-md">
              <div className="grid grid-cols-2 gap-fluid-sm">
                <div>
                  <Label htmlFor="size" className="text-neutral-400 font-sora text-xs">Size</Label>
                  <select
                    id="size"
                    value={editForm.size || ''}
                    onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}
                    className="w-full px-fluid-md py-fluid-xs bg-neutral-900 text-white border border-neutral-800 rounded-xl focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/20 transition-colors"
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

                <div>
                  <Label htmlFor="condition" className="text-neutral-400 font-sora text-xs">Condition</Label>
                  <select
                    id="condition"
                    value={editForm.condition || ''}
                    onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                    className="w-full px-fluid-md py-fluid-xs bg-neutral-900 text-white border border-neutral-800 rounded-xl focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/20 transition-colors"
                  >
                    <option value="">Select condition</option>
                    {conditions.map((condition) => (
                      <option key={condition.value} value={condition.value}>
                        {condition.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="purchaseDate" className="text-neutral-400 font-sora text-xs">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={editForm.purchaseDate ? new Date(editForm.purchaseDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditForm({ ...editForm, purchaseDate: e.target.value })}
                    className="bg-neutral-900 text-white border-neutral-800 rounded-xl focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="comfortScore" className="text-neutral-400 font-sora text-xs">Comfort (1-10)</Label>
                    <div className="group relative">
                      <HelpCircle className="w-3.5 h-3.5 text-neutral-600 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 text-xs text-neutral-300 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-800">
                        How comfortable this shoe feels for your feet
                      </div>
                    </div>
                  </div>
                  <Input
                    id="comfortScore"
                    type="number"
                    min="1"
                    max="10"
                    value={editForm.comfortScore || ''}
                    onChange={(e) => setEditForm({ ...editForm, comfortScore: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="1-10"
                    className="bg-neutral-900 text-white placeholder:text-neutral-600 border-neutral-800 rounded-xl focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
                  />
                </div>

                <div className="relative">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="performanceRating" className="text-neutral-400 font-sora text-xs">Performance (1-10)</Label>
                    <div className="group relative">
                      <HelpCircle className="w-3.5 h-3.5 text-neutral-600 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 text-xs text-neutral-300 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-800">
                        Rate how this shoe performs for your climbing style
                      </div>
                    </div>
                  </div>
                  <Input
                    id="performanceRating"
                    type="number"
                    min="1"
                    max="10"
                    value={editForm.performanceRating || ''}
                    onChange={(e) => setEditForm({ ...editForm, performanceRating: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="1-10"
                    className="bg-neutral-900 text-white placeholder:text-neutral-600 border-neutral-800 rounded-xl focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="durabilityRating" className="text-neutral-400 font-sora text-xs">Durability (1-10)</Label>
                    <div className="group relative">
                      <HelpCircle className="w-3.5 h-3.5 text-neutral-600 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 text-xs text-neutral-300 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-800">
                        How well this shoe holds up over time
                      </div>
                    </div>
                  </div>
                  <Input
                    id="durabilityRating"
                    type="number"
                    min="1"
                    max="10"
                    value={editForm.durabilityRating || ''}
                    onChange={(e) => setEditForm({ ...editForm, durabilityRating: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="1-10"
                    className="bg-neutral-900 text-white placeholder:text-neutral-600 border-neutral-800 rounded-xl focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div className="border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, showNotes: !editForm.showNotes })}
                  className="flex items-center justify-between w-full py-fluid-sm text-sm text-neutral-400 hover:text-white transition-colors font-sora"
                >
                  <span>Additional Notes</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${editForm.showNotes ? 'rotate-180' : ''}`} />
                </button>
                {editForm.showNotes && (
                  <div className="pb-2">
                    <Textarea
                      id="notes"
                      value={editForm.notes || ''}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      placeholder="Any additional notes about this shoe..."
                      rows={2}
                      className="bg-neutral-900 text-white placeholder:text-neutral-600 border-neutral-800 rounded-xl focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 resize-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-fluid-sm pt-fluid-sm">
                <Button
                  variant="outline"
                  className="flex-1 border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 hover:border-neutral-700 rounded-xl py-fluid-xs"
                  onClick={() => setEditingShoe(null)}
                >
                  Cancel
                </Button>
                {removeShoe && (
                  <Button
                    variant="destructive"
                    onClick={removeShoe}
                    className="px-fluid-md bg-red-900/30 border border-red-500/20 text-red-400 hover:bg-red-900/50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-black font-tanker rounded-xl py-fluid-xs"
                  onClick={updateShoeStats}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

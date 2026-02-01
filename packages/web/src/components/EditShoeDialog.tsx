'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, HelpCircle, ChevronDown } from 'lucide-react';
import { shoeSizes, conditions, type ShoeSizeOption } from '@/constants/shoe-data';
import type { UserShoe } from '@/types/api';
import type { EditFormData } from '@/schemas/shoe-schema';

interface EditShoeDialogProps {
  editingShoe: UserShoe | null;
  editForm: EditFormData;
  setEditForm: (form: EditFormData) => void;
  setEditingShoe: (shoe: UserShoe | null) => void;
  updateShoeStats: () => void;
}

export default function EditShoeDialog({
  editingShoe,
  editForm,
  setEditForm,
  setEditingShoe,
  updateShoeStats,
}: EditShoeDialogProps) {
  return (
    <AnimatePresence>
      {editingShoe && (
        <Dialog open={!!editingShoe} onOpenChange={() => setEditingShoe(null)}>
          <DialogContent className="bg-gray-900/95 backdrop-blur-sm text-gray-100 border border-gray-700 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-gray-100 font-so-cloudy uppercase">Edit Shoe Stats</DialogTitle>
              <DialogDescription className="text-sm text-gray-400">
                {editingShoe.shoe.name} - {editingShoe.shoe.brand}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="size">Size</Label>
                  <select
                    id="size"
                    value={editForm.size || ''}
                    onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800/50 text-gray-100 border border-gray-600 rounded-md focus:border-gray-500 focus:outline-none"
                  >
                    <option value="">Select size</option>
                    {shoeSizes.map((size: ShoeSizeOption, index) => {
                      if ('separator' in size && size.separator) {
                        return (
                          <option key={`separator-${index}`} disabled className="text-gray-600">
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
                  <Label htmlFor="condition">Condition</Label>
                  <select
                    id="condition"
                    value={editForm.condition || ''}
                    onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800/50 text-gray-100 border border-gray-600 rounded-md focus:border-gray-500 focus:outline-none"
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
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={editForm.purchaseDate || ''}
                    onChange={(e) => setEditForm({ ...editForm, purchaseDate: e.target.value })}
                    className="bg-gray-800/50 text-gray-100 border-gray-600 focus:border-gray-500"
                  />
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="comfortScore">Comfort (1-10)</Label>
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-500 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-xs text-gray-300 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
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
                    className="bg-gray-800/50 text-gray-100 placeholder:text-gray-500 border-gray-600 focus:border-gray-500"
                  />
                </div>
                
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="performanceRating">Performance (1-10)</Label>
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-500 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-xs text-gray-300 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
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
                    className="bg-gray-800/50 text-gray-100 placeholder:text-gray-500 border-gray-600 focus:border-gray-500"
                  />
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="durabilityRating">Durability (1-10)</Label>
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-500 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-xs text-gray-300 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
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
                    className="bg-gray-800/50 text-gray-100 placeholder:text-gray-500 border-gray-600 focus:border-gray-500"
                  />
                </div>
              </div>
              
              {/* Collapsible Notes Section */}
              <div className="border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, showNotes: !editForm.showNotes })}
                  className="flex items-center justify-between w-full py-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <span>Additional Notes</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${editForm.showNotes ? 'rotate-180' : ''}`} />
                </button>
                {editForm.showNotes && (
                  <div className="pt-2">
                    <Textarea
                      id="notes"
                      value={editForm.notes || ''}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      placeholder="Any additional notes about this shoe..."
                      rows={2}
                      className="bg-gray-800/50 text-gray-100 placeholder:text-gray-500 border-gray-600 focus:border-gray-500 resize-none"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditingShoe(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
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

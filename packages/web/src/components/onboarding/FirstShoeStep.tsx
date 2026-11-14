import { motion } from "framer-motion";
import ShoeImage from "@/components/ShoeImage";
import { ShoeSearch } from "@/components/ShoeSearch";
import { shoeSizes } from "@/constants/shoe-data";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Shoe } from "@/types/api";
import { RatingButton, BackButton } from "@/components/onboarding/OnboardingHelpers";

type ShoeSizeOption = { value: string; label: string };
const isShoeSizeOption = (
  size: (typeof shoeSizes)[number],
): size is ShoeSizeOption => {
  return "value" in size;
};

export interface ShoeFormData {
  size: string;
  condition: string;
  comfort: number;
  performance: number;
  notes: string;
}

interface FirstShoeStepProps {
  selectedShoe: Shoe | null;
  shoeFormData: ShoeFormData;
  isLoading: boolean;
  onShoeSelect: (shoe: Shoe) => void;
  onShoeFormDataChange: (shoeFormData: ShoeFormData) => void;
  onNext: () => void;
  onBack: () => void;
}

export function FirstShoeStep({
  selectedShoe,
  shoeFormData,
  isLoading,
  onShoeSelect,
  onShoeFormDataChange,
  onNext,
  onBack,
}: FirstShoeStepProps) {
  return (
    <div className="lab-card p-fluid-xl">
      <h2 className="lab-title text-fluid-2xl mb-8">
        ADD YOUR FIRST SHOE
      </h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="lab-label font-mono">
            Search shoes
          </Label>
          <div className="mt-2">
            <ShoeSearch
              onShoeSelect={onShoeSelect}
              selectedShoe={selectedShoe}
            />
          </div>
        </div>

        {selectedShoe && (
          <div className="lab-card lab-card-active p-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-black/40 rounded-lg border border-white/6 overflow-hidden">
                <ShoeImage
                  brand={selectedShoe.brand}
                  shoeName={selectedShoe.name}
                  className="w-full h-full object-contain p-2"
                  {...(selectedShoe.imageUrl
                    ? { imageUrl: selectedShoe.imageUrl }
                    : {})}
                  {...(selectedShoe.slug
                    ? { slug: selectedShoe.slug }
                    : {})}
                />
              </div>
              <div>
                <h3 className="font-mono font-semibold text-brand-chalk">
                  {selectedShoe.name}
                </h3>
                <p className="lab-label font-mono text-brand-putty/50">
                  {selectedShoe.brand}
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedShoe && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="lab-label font-mono">
                  Size
                </Label>
                <Select
                  value={shoeFormData.size}
                  onValueChange={(value) =>
                    onShoeFormDataChange({
                      ...shoeFormData,
                      size: value,
                    })
                  }
                >
                  <SelectTrigger className="rounded-lg bg-black border border-white/6 text-brand-chalk h-12 focus:border-brand-red">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-surface border-white/6">
                    {shoeSizes
                      .filter(isShoeSizeOption)
                      .map((size) => (
                        <SelectItem
                          key={size.value}
                          value={size.value}
                        >
                          {size.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="lab-label font-mono">
                  Condition
                </Label>
                <Select
                  value={shoeFormData.condition}
                  onValueChange={(value: string) =>
                    onShoeFormDataChange({
                      ...shoeFormData,
                      condition: value,
                    })
                  }
                >
                  <SelectTrigger className="rounded-lg bg-black border border-white/6 text-brand-chalk h-12 focus:border-brand-red">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-surface border-white/6">
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like-new">
                      Like New
                    </SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="worn">Worn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="lab-label font-mono">
                  Comfort
                </Label>
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <RatingButton
                      key={rating}
                      rating={rating}
                      currentRating={shoeFormData.comfort}
                      onRatingChange={(rating) =>
                        onShoeFormDataChange({
                          ...shoeFormData,
                          comfort: rating,
                        })
                      }
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="lab-label font-mono">
                  Performance
                </Label>
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <RatingButton
                      key={rating}
                      rating={rating}
                      currentRating={shoeFormData.performance}
                      onRatingChange={(rating) =>
                        onShoeFormDataChange({
                          ...shoeFormData,
                          performance: rating,
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="lab-label font-mono">
                Notes (optional)
              </Label>
              <Textarea
                id="notes"
                value={shoeFormData.notes}
                onChange={(e) =>
                  onShoeFormDataChange({
                    ...shoeFormData,
                    notes: e.target.value,
                  })
                }
                placeholder="Any additional notes about this shoe..."
                rows={3}
                className="rounded-lg bg-black border border-white/6 text-brand-chalk placeholder:text-brand-putty/30 focus:border-brand-red"
              />
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <BackButton onClick={onBack} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            disabled={
              !selectedShoe || !shoeFormData.size || isLoading
            }
            className="lab-button"
          >
            {isLoading ? "COMPLETING..." : "COMPLETE SETUP"}{" "}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

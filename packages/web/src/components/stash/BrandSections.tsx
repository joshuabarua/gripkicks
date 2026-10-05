import { motion } from "framer-motion";
import { memo } from "react";
import CloudShoe from "@/components/CloudShoe";
import type { UserShoe } from "@/types/api";
import type { SpecialLabelType } from "@/utils/specialLabels";
import type { ShoeVariantGroup } from "@/utils/shoeVariants";
import { BrandLogo } from "@/components/stash/BrandLogo";
import { getBrandDescription } from "@/utils/sanctuaryDescriptions";

interface BrandGroup {
  brand: string;
  models: ShoeVariantGroup<UserShoe>[];
}

interface BrandSectionsProps {
  groups: BrandGroup[];
  specialLabels: Record<string, { type: SpecialLabelType; icon: React.ReactNode }>;
  onSelect: (shoe: UserShoe) => void;
  onEdit: (shoe: UserShoe) => void;
}

const BrandSections = memo<BrandSectionsProps>(({ groups, specialLabels, onSelect, onEdit }) => {
  return (
    <div className="space-y-fluid-2xl">
      {groups.map(({ brand, models }, brandIndex) => (
        <motion.div
          key={brand}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: brandIndex * 0.15 }}
        >
          <div className="mb-fluid-lg space-y-3">
            <div className="flex items-center gap-fluid-md">
              <h2 aria-label={brand}><BrandLogo brand={brand} /></h2>
              <div className="flex-1 h-px bg-white/20" />
              <span className="font-sora text-xs text-brand-putty tracking-wider">{models.length} {models.length === 1 ? "MODEL" : "MODELS"}</span>
            </div>
            {getBrandDescription(brand) && (
              <p className="max-w-2xl font-sora text-sm leading-relaxed text-brand-putty">
                {getBrandDescription(brand)}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-fluid-lg">
            {models.map((model, modelIndex) => (
              <div key={model.groupKey} className="min-w-0 flex flex-col gap-fluid-md">
                {model.variants.map(({ item: shoe, variantLabel }, variantIndex) => (
                  <div key={shoe._id} className="w-full min-w-0 space-y-2">
                    <CloudShoe
                      shoe={shoe}
                      onClick={() => onSelect(shoe)}
                      onEdit={() => onEdit(shoe)}
                      index={variantIndex + modelIndex * 10 + brandIndex * 100}
                      variantLabel={variantLabel}
                      specialLabel={specialLabels[shoe._id]}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if groups length, special labels, or onSelect changed
  if (prevProps.groups.length !== nextProps.groups.length) return false;
  if (prevProps.onSelect !== nextProps.onSelect) return false;
  if (prevProps.onEdit !== nextProps.onEdit) return false;

  // Check if special labels changed
  const prevLabelsKeys = Object.keys(prevProps.specialLabels);
  const nextLabelsKeys = Object.keys(nextProps.specialLabels);
  if (prevLabelsKeys.length !== nextLabelsKeys.length) return false;
  if (prevLabelsKeys.some((key) => prevProps.specialLabels[key]?.type !== nextProps.specialLabels[key]?.type)) return false;

  // Check if any group structure changed
  for (let i = 0; i < prevProps.groups.length; i++) {
    const prevGroup = prevProps.groups[i];
    const nextGroup = nextProps.groups[i];

    if (!prevGroup || !nextGroup) return false;

    if (prevGroup.brand !== nextGroup.brand) return false;
    if (prevGroup.models.length !== nextGroup.models.length) return false;

    for (let j = 0; j < prevGroup.models.length; j++) {
      const prevModel = prevGroup.models[j];
      const nextModel = nextGroup.models[j];
      if (!prevModel || !nextModel) return false;
      if (prevModel.groupKey !== nextModel.groupKey) return false;
      if (prevModel.variants.length !== nextModel.variants.length) return false;

      if (nextModel.variants.some((variant, index) => variant.item !== prevModel.variants[index]?.item || variant.variantLabel !== prevModel.variants[index]?.variantLabel)) return false;
    }
  }

  return true;
});

BrandSections.displayName = "BrandSections";

export { BrandSections };

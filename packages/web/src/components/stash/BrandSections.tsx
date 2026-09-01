import { motion } from "framer-motion";
import { memo } from "react";
import CloudShoe from "@/components/CloudShoe";
import type { UserShoe } from "@/types/api";
import type { SpecialLabelType } from "@/utils/specialLabels";
import type { ShoeVariantGroup } from "@/utils/shoeVariants";
import { BrandLogo } from "@/components/stash/BrandLogo";

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
          <div className="flex items-center gap-fluid-sm mb-fluid-lg">
            <h2><BrandLogo brand={brand} /></h2>
            <div className="flex-1 h-px bg-neutral-800" />
            <span className="font-sora text-[10px] text-neutral-600 tracking-wider">{models.length} {models.length === 1 ? "MODEL" : "MODELS"}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-fluid-lg">
            {models.map((model, modelIndex) => (
              <div key={model.groupKey} className="flex flex-wrap gap-fluid-md">
                {model.variants.map(({ item: shoe, variantLabel }, variantIndex) => (
                  <div key={shoe._id} className="space-y-2">
                    {model.variants.length > 1 && (
                      <p className="pl-1 font-sora text-[10px] uppercase tracking-wider text-neutral-500">
                        {variantLabel || "Standard"}
                      </p>
                    )}
                    <CloudShoe
                      shoe={shoe}
                      onClick={() => onSelect(shoe)}
                      onEdit={() => onEdit(shoe)}
                      index={variantIndex + modelIndex * 10 + brandIndex * 100}
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

      const prevVariantIds = prevModel.variants.map((v) => v.item._id).sort().join(",");
      const nextVariantIds = nextModel.variants.map((v) => v.item._id).sort().join(",");
      if (prevVariantIds !== nextVariantIds) return false;
    }
  }

  return true;
});

BrandSections.displayName = "BrandSections";

export { BrandSections };

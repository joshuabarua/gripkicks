"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { memo, useState, type CSSProperties } from "react";
import { ChevronDown } from "lucide-react";
import CloudShoe from "@/components/CloudShoe";
import type { UserShoe } from "@/types/api";
import type { SpecialLabelType } from "@/utils/specialLabels";
import type { ShoeVariantGroup } from "@/utils/shoeVariants";

interface BrandGroup {
  brand: string;
  models: ShoeVariantGroup<UserShoe>[];
}

interface BrandSectionsProps {
  groups: BrandGroup[];
  specialLabels: Record<string, { type: SpecialLabelType; icon: React.ReactNode }>;
  onOpenStats: (shoe: UserShoe) => void;
  onEdit: (shoe: UserShoe) => void;
  onToggleFavourite: (shoe: UserShoe) => void;
  onRemove: (shoe: UserShoe) => void;
}

const BrandSections = memo<BrandSectionsProps>(({ groups, specialLabels, onOpenStats, onEdit, onToggleFavourite, onRemove }) => {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const reduceMotion = useReducedMotion();

  const toggleBrand = (brand: string) => {
    setCollapsed((previous) => {
      const next = new Set(previous);
      if (next.has(brand)) next.delete(brand);
      else next.add(brand);
      return next;
    });
  };

  return (
    <div>
      <div className="grid gap-fluid-xl lg:grid-cols-2">
        {groups.map(({ brand, models }, brandIndex) => {
          const isCollapsed = collapsed.has(brand);
          const compact = models.length <= 2;
          const regionId = `brand-${brand.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
          return (
            <section
              key={brand}
              aria-labelledby={`${regionId}-title`}
              style={{ "--rise-delay": `${200 + Math.min(brandIndex, 4) * 90}ms` } as CSSProperties}
              className={`lab-rise ${compact ? "lg:col-span-1" : "lg:col-span-2"}`}
            >
              <div className="mb-fluid-lg flex items-center gap-fluid-md">
                <h2 id={`${regionId}-title`} className="lab-title shrink-0 text-fluid-2xl text-white">{brand}</h2>
                <button
                  type="button"
                  aria-expanded={!isCollapsed}
                  aria-controls={regionId}
                  aria-label={`${brand} brand section, ${models.length} ${models.length === 1 ? "model" : "models"}`}
                  onClick={() => toggleBrand(brand)}
                  className="flex min-h-11 flex-1 items-center gap-fluid-md text-left"
                >
                  <div aria-hidden="true" className="h-px flex-1 bg-white/20" />
                  <span className="font-mono text-xs tracking-wider text-brand-putty">{models.length} {models.length === 1 ? "MODEL" : "MODELS"}</span>
                  <ChevronDown aria-hidden="true" className={`h-4 w-4 text-brand-putty transition-transform duration-300 motion-reduce:transform-none ${isCollapsed ? "" : "rotate-180"}`} />
                </button>
              </div>

              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    key="brand-content"
                    id={regionId}
                    initial={reduceMotion ? { height: "auto" } : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduceMotion ? { height: "auto", opacity: 1, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="overflow-hidden"
                  >
                    <div className={`grid items-start gap-fluid-lg ${compact ? "grid-cols-1 sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>
                      {models.map((model) => (
                        <div key={model.groupKey} className="flex min-w-0 flex-col gap-fluid-md">
                          {model.variants.map(({ item: shoe, variantLabel }) => (
                            <div key={shoe._id} className="w-full min-w-0">
                              <CloudShoe
                                shoe={shoe}
                                variantLabel={variantLabel}
                                specialLabel={specialLabels[shoe._id]}
                                onOpenStats={() => onOpenStats(shoe)}
                                onEdit={() => onEdit(shoe)}
                                onToggleFavourite={() => onToggleFavourite(shoe)}
                                onRemove={() => onRemove(shoe)}
                              />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          );
        })}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if groups length, special labels, or handlers changed
  if (prevProps.groups.length !== nextProps.groups.length) return false;
  if (prevProps.onOpenStats !== nextProps.onOpenStats) return false;
  if (prevProps.onEdit !== nextProps.onEdit) return false;
  if (prevProps.onToggleFavourite !== nextProps.onToggleFavourite) return false;
  if (prevProps.onRemove !== nextProps.onRemove) return false;

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

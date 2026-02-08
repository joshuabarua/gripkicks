import { motion } from 'framer-motion';
import CloudShoe from '@/components/CloudShoe';
import type { UserShoe } from '@/types/api';
import type { SpecialLabelType } from '@/utils/specialLabels';

interface BrandGroup {
  brand: string;
  shoes: UserShoe[];
}

interface BrandSectionsProps {
  groups: BrandGroup[];
  specialLabels: Record<string, { type: SpecialLabelType; icon: React.ReactNode }>;
  onSelect: (shoe: UserShoe) => void;
}

export function BrandSections({ groups, specialLabels, onSelect }: BrandSectionsProps) {
  return (
    <div className="space-y-fluid-2xl">
      {groups.map(({ brand, shoes }, brandIndex) => (
        <motion.div
          key={brand}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: brandIndex * 0.15 }}
        >
          <div className="flex items-center gap-fluid-sm mb-fluid-lg">
            <h2 className="font-so-cloudy uppercase text-fluid-3xl md:text-fluid-4xl text-white">{brand}</h2>
            <div className="flex-1 h-px bg-neutral-800" />
            <span className="font-mono text-[10px] text-neutral-600 tracking-wider">{shoes.length} {shoes.length === 1 ? 'SHOE' : 'SHOES'}</span>
          </div>
          <div className="flex flex-wrap gap-fluid-md">
            {shoes.map((shoe, index) => (
              <CloudShoe
                key={shoe._id}
                shoe={shoe}
                onClick={() => onSelect(shoe)}
                index={index + brandIndex * 10}
                specialLabel={specialLabels[shoe._id]}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

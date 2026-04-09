'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface ShoeTagsProps {
  aggressiveness?: string | undefined;
  climbingDiscipline?: string | undefined;
  stiffness?: string | undefined;
  volume?: string | undefined;
  rubberCompound?: string | undefined;
}

interface TagChipProps {
  label: string;
  value: string;
  tooltip: string;
}

function TagChip({ label, value, tooltip }: TagChipProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="flex items-center gap-1.5 cursor-help">
            <span className="text-[10px] text-neutral-500 flex items-center gap-1 font-sora">
              {label}
              <Info className="w-3 h-3 text-neutral-600" />
            </span>
            <span className="px-3 py-1 bg-neutral-900 rounded-full text-xs font-medium text-orange-500 border border-neutral-800">
              {value}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5} className="bg-neutral-900 border border-neutral-700 max-w-md z-[9999] shadow-xl" style={{ zIndex: 9999 }}>
          <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line font-sora">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const getAggressivenessTooltip = (value: string) => {
  const base = "Aggressiveness = the downturn (curve) from heel to toe. More aggressive means more power on overhangs but less comfort.\n\n";
  const options = "OPTIONS: Flat → Moderate → Aggressive\n\n";
  switch (value.toLowerCase()) {
    case 'flat': return base + options + "FLAT: Zero downturn, completely flat profile. Best for beginners, slab climbing, crack climbing, and all-day comfort on multi-pitch trad routes. Examples: Mythos, Tarantula, Finale.";
    case 'moderate': return base + options + "MODERATE: Slight downturn balancing comfort with performance. Great for vertical to slightly overhanging sport routes and gym climbing. Examples: Aragon, Kubo, Mistral.";
    case 'aggressive': return base + options + "AGGRESSIVE: Pronounced hook shape pulling toes down for maximum power on steep overhangs, roofs, and bouldering. Less comfortable but more precise. Examples: Solution, Skwama, Genius, Mandala.";
    default: return base + options;
  }
};

const getDisciplineTooltip = (value: string) => {
  const base = "The climbing style this shoe is optimized for.\n\n";
  const options = "OPTIONS: Gym • Sport • Bouldering • Trad • Competition\n\n";
  switch (value.toLowerCase()) {
    case 'gym': return base + options + "GYM/INDOOR: Optimized for plastic holds with softer rubber and comfort for high-volume sessions. Good all-rounders for indoor training. Examples: Kubo, Tarantulace, Veloce.";
    case 'sport': return base + options + "SPORT: Designed for bolted outdoor routes. Emphasis on edging precision, heel/toe hooks, and performance on steep terrain. Examples: Aragon, Mistral, Genius.";
    case 'bouldering': return base + options + "BOULDERING: Built for short, powerful problems. Prioritizes sensitivity, toe power, aggressive heel cups, and precise footwork. Examples: Skwama, Mandala, Tarantula Boulder.";
    case 'trad': return base + options + "TRAD: Comfort-focused for long multi-pitch days placing gear. Stiffer for crack climbing and standing on small edges for hours. Examples: Mythos, Finale, TC Pro.";
    case 'competition': return base + options + "COMPETITION: Maximum performance for comp-style climbing. Extremely sensitive with aggressive fit for dynamic moves and coordination. Examples: Ondra Comp, Solution Comp.";
    case 'all-around': return base + options + "ALL-AROUND: Jack of all trades. Good for climbers who want one shoe for everything from gym to crag without specializing.";
    default: return base + options;
  }
};

const getStiffnessTooltip = (value: string) => {
  const base = "Midsole stiffness affects power transfer and feel on holds.\n\n";
  const options = "OPTIONS: Soft → Medium → Stiff\n\n";
  switch (value.toLowerCase()) {
    case 'soft': return base + options + "SOFT: Maximum sensitivity to feel the rock. Excels on smears, volumes, and comp-style climbing. Requires more foot strength on tiny edges. Examples: Skwama, Genius, Mandala.";
    case 'medium': return base + options + "MEDIUM: Balanced support and feel. Good for most climbing styles without specializing. Works well for gym, sport, and moderate trad. Examples: Aragon, Kubo, Finale.";
    case 'stiff': return base + options + "STIFF: Acts like a platform for standing on small edges. Less sensitivity but saves energy on long routes and crack climbing. Examples: TC Pro, Katana Lace.";
    default: return base + options;
  }
};

const getVolumeTooltip = (value: string) => {
  const base = "Volume = internal space of the shoe, affecting fit for different foot shapes.\n\n";
  const options = "OPTIONS: Low • Medium • High\n\n";
  switch (value.toLowerCase()) {
    case 'low': return base + options + "LOW VOLUME: Narrow last with less space. Best for slim/narrow feet, low arches, or those who prefer a snug performance fit. Many women's shoes are low volume. Examples: Finale, Mythos Eco, Stickit.";
    case 'medium': return base + options + "MEDIUM VOLUME: Standard fit that works for most foot shapes. A safe choice if you're unsure of your foot volume. Examples: Skwama, Mandala, Mistral.";
    case 'high': return base + options + "HIGH VOLUME: Roomier fit with more space in toe box and midfoot. Ideal for wider feet, higher arches, or those who prefer comfort over performance fit. Examples: Veloce, Ondra Comp.";
    default: return base + options;
  }
};

const getRubberTooltip = (value: string) => {
  const base = "Rubber compound affects grip, durability, and sensitivity. Softer = more grip but wears faster.\n\n";
  if (value.toLowerCase().includes('vibram') || value.toLowerCase().includes('xs')) return base + "VIBRAM XS GRIP/EDGE: Industry-standard rubber used by La Sportiva. XS Grip is softer (4mm) for maximum friction on smears. XS Edge is harder for edging durability on small holds.";
  if (value.toLowerCase().includes('stealth') && value.toLowerCase().includes('c4')) return base + "STEALTH C4: Five Ten's softest rubber compound. Maximum friction for smearing and volumes but wears quickly. Popular on bouldering shoes.";
  if (value.toLowerCase().includes('stealth')) return base + "FIVE TEN STEALTH: Legendary sticky rubber known for exceptional friction on all rock types. The gold standard for grip. Used on all Five Ten/Adidas climbing shoes.";
  if (value.toLowerCase().includes('trax')) return base + "SCARPA TRAX: Proprietary rubber offering good balance of stickiness and durability. Used on Scarpa shoes like Instinct and Drago.";
  if (value.toLowerCase().includes('science friction')) return base + "MAD ROCK SCIENCE FRICTION: Soft, high-friction rubber designed for maximum grip. Known for excellent smearing performance.";
  if (value.toLowerCase().includes('frixion')) return base + "FRIXION: La Sportiva's rubber compound offering excellent grip and durability balance. Used on many La Sportiva models.";
  return base + value.toUpperCase() + ": Specialized rubber compound tuned for this shoe's intended climbing style.";
};

export default function ShoeTags({
  aggressiveness,
  climbingDiscipline,
  stiffness,
  volume,
  rubberCompound
}: ShoeTagsProps) {
  const hasAnyTag = aggressiveness || climbingDiscipline || stiffness || volume || rubberCompound;

  if (!hasAnyTag) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {aggressiveness && (
        <TagChip label="Aggressiveness" value={aggressiveness} tooltip={getAggressivenessTooltip(aggressiveness)} />
      )}
      {climbingDiscipline && (
        <TagChip label="Discipline" value={climbingDiscipline} tooltip={getDisciplineTooltip(climbingDiscipline)} />
      )}
      {stiffness && (
        <TagChip label="Stiffness" value={stiffness} tooltip={getStiffnessTooltip(stiffness)} />
      )}
      {volume && (
        <TagChip label="Volume" value={volume} tooltip={getVolumeTooltip(volume)} />
      )}
      {rubberCompound && (
        <TagChip label="Rubber" value={rubberCompound} tooltip={getRubberTooltip(rubberCompound)} />
      )}
    </div>
  );
}

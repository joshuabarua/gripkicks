'use client';

interface ShoeTagsProps {
  aggressiveness?: string;
  climbingDiscipline?: string;
  stiffness?: string;
  volume?: string;
  rubberCompound?: string;
}

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
        <div className="flex items-center gap-1">
          <span className="text-xs text-white/60">Aggressiveness:</span>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/30">
            {aggressiveness}
          </span>
        </div>
      )}
      {climbingDiscipline && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-white/60">Discipline:</span>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/30">
            {climbingDiscipline}
          </span>
        </div>
      )}
      {stiffness && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-white/60">Stiffness:</span>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/30">
            {stiffness}
          </span>
        </div>
      )}
      {volume && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-white/60">Volume:</span>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/30">
            {volume}
          </span>
        </div>
      )}
      {rubberCompound && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-white/60">Rubber:</span>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/30">
            {rubberCompound}
          </span>
        </div>
      )}
    </div>
  );
}

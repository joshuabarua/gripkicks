import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { BackButton } from "@/components/onboarding/OnboardingHelpers";

interface FootDataStepProps {
  footShape: string;
  footVolume: string;
  isLoading: boolean;
  onFootShapeChange: (footShape: string) => void;
  onFootVolumeChange: (footVolume: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function FootDataStep({
  footShape,
  footVolume,
  isLoading,
  onFootShapeChange,
  onFootVolumeChange,
  onNext,
  onBack,
}: FootDataStepProps) {
  return (
    <div className="lab-card p-fluid-xl">
      <h2 className="lab-title text-fluid-2xl mb-8">FOOT SHAPE</h2>

      <div className="space-y-6">
        <div>
          <Label className="lab-label font-mono">
            Select shape
          </Label>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {[
              {
                value: "egyptian",
                label: "Egyptian",
                desc: "Big toe longest",
              },
              {
                value: "roman",
                label: "Roman",
                desc: "First 3 toes even",
              },
              {
                value: "greek",
                label: "Greek",
                desc: "Second toe longest",
              },
              {
                value: "germanic",
                label: "Germanic",
                desc: "Big toe, others even",
              },
              {
                value: "celtic",
                label: "Celtic",
                desc: "Big & 2nd toe even",
              },
            ].map((shape) => (
              <motion.button
                key={shape.value}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onFootShapeChange(shape.value)}
                className={`lab-card w-full p-3 text-left transition-all ${footShape === shape.value
                    ? "lab-card-active hal-glow"
                    : ""
                  }`}
              >
                <div className="font-mono font-medium text-brand-chalk text-sm">
                  {shape.label}
                </div>
                <div className="font-mono text-xs text-brand-putty/60 mt-1 leading-tight">
                  {shape.desc}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="lab-label font-mono">
            Foot volume
          </Label>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {[
              { value: "low", label: "Low", desc: "Narrow" },
              { value: "medium", label: "Medium", desc: "Average" },
              { value: "high", label: "High", desc: "Wide" },
            ].map((volume) => (
              <motion.button
                key={volume.value}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onFootVolumeChange(volume.value)}
                className={`lab-card w-full p-3 text-center transition-all ${footVolume === volume.value
                    ? "lab-card-active hal-glow"
                    : ""
                  }`}
              >
                <div className="font-mono font-medium text-brand-chalk text-sm">
                  {volume.label}
                </div>
                <div className="font-mono text-xs text-brand-putty/60 mt-1 leading-tight">
                  {volume.desc}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <BackButton onClick={onBack} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            disabled={!footShape || !footVolume || isLoading}
            className="lab-button"
          >
            {isLoading ? "SAVING..." : "NEXT"}{" "}
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

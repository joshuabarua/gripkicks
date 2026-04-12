"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { cn } from "@/lib/utils";

const FootModelViewer = dynamic(
  () => import("@/components/FootModelViewer"),
  { ssr: false },
);

const baseModels = [
  { label: "Default", description: "Baseline model", modelPath: "/glb/foot.optimized.glb" },
];

const shapeModels = [
  { label: "Egyptian", description: "Egyptian shape", modelPath: "/glb/foot.egyptian.optimized.glb" },
  { label: "Roman", description: "Roman shape", modelPath: "/glb/foot.roman.optimized.glb" },
  { label: "Greek", description: "Greek shape", modelPath: "/glb/foot.greek.optimized.glb" },
];

const volumeModels = [
  { label: "Low", description: "Low volume", modelPath: "/glb/foot.low.optimized.glb" },
  { label: "Medium", description: "Medium volume", modelPath: "/glb/foot.medium.optimized.glb" },
  { label: "High", description: "High volume", modelPath: "/glb/foot.high.optimized.glb" },
];

export default function FootModelPage() {
  const [selectedModel, setSelectedModel] = useState("/glb/foot.optimized.glb");

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white md:px-10 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <h1 className="font-tanker text-5xl leading-none md:text-7xl">
              Foot Models
            </h1>
          </div>
          <Link
            href="/footscan"
            className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-6 py-2 text-sm text-white/70 hover:text-white"
          >
            Back
          </Link>
        </div>

        <div className="h-[60vh] w-full overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900">
          <FootModelViewer key={selectedModel} modelPath={selectedModel} />
        </div>

        <div className="space-y-8">
          <ModelSection title="BASE MODELS" models={baseModels} selectedModel={selectedModel} onSelect={setSelectedModel} />
          <ModelSection title="SHAPE MODELS" models={shapeModels} selectedModel={selectedModel} onSelect={setSelectedModel} />
          <ModelSection title="VOLUME MODELS" models={volumeModels} selectedModel={selectedModel} onSelect={setSelectedModel} />
        </div>
      </div>
    </main>
  );
}

function ModelSection({
  title,
  models,
  selectedModel,
  onSelect,
}: {
  title: string;
  models: { label: string; description: string; modelPath: string }[];
  selectedModel: string;
  onSelect: (path: string) => void;
}) {
  return (
    <div>
      <h2 className="font-tanker text-2xl mb-4">{title}</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {models.map((model) => (
          <ModelCard key={model.modelPath} model={model} isSelected={selectedModel === model.modelPath} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function ModelCard({
  model,
  isSelected,
  onSelect,
}: {
  model: { label: string; description: string; modelPath: string };
  isSelected: boolean;
  onSelect: (path: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(model.modelPath)}
      className={cn(
        "rounded-2xl border p-4 text-left transition-colors",
        isSelected
          ? "border-white/40 bg-neutral-800"
          : "border-neutral-800 bg-neutral-900 hover:border-neutral-700"
      )}
    >
      <div className="mb-2 h-32 w-full overflow-hidden rounded-xl border border-neutral-700">
        <FootModelViewer modelPath={model.modelPath} containerClassName="w-full h-full" />
      </div>
      <h3 className="font-tanker text-lg">{model.label}</h3>
      <p className="text-sm text-neutral-500">{model.description}</p>
    </button>
  );
}

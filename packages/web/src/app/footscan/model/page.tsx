"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const FootModelViewer = dynamic(
  () => import("@/components/FootModelViewer"),
  { ssr: false },
);

const baseModels = [
  {
    label: "Default optimized",
    description: "Baseline viewer model for quick comparison.",
    modelPath: "/glb/foot.optimized.glb",
    shape: "roman",
    volume: "medium",
  },
];

const shapeModels = [
  {
    label: "Egyptian",
    description: "Shape-specific optimized foot model.",
    modelPath: "/glb/foot.egyptian.optimized.glb",
    shape: "egyptian",
    volume: "medium",
  },
  {
    label: "Roman",
    description: "Shape-specific optimized foot model.",
    modelPath: "/glb/foot.roman.optimized.glb",
    shape: "roman",
    volume: "medium",
  },
  {
    label: "Greek",
    description: "Shape-specific optimized foot model.",
    modelPath: "/glb/foot.greek.optimized.glb",
    shape: "greek",
    volume: "medium",
  },
];

const volumeModels = [
  {
    label: "Low Volume",
    description: "Low volume foot model.",
    modelPath: "/glb/foot.roman.low.glb",
    shape: "roman",
    volume: "low",
  },
  {
    label: "Medium Volume",
    description: "Medium volume foot model.",
    modelPath: "/glb/foot.roman.medium.glb",
    shape: "roman",
    volume: "medium",
  },
  {
    label: "High Volume",
    description: "High volume foot model.",
    modelPath: "/glb/foot.roman.high.glb",
    shape: "roman",
    volume: "high",
  },
];

export default function FootModelPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white md:px-10 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30">
              Foot Lab Model Testing
            </p>
            <h1 className="font-tanker text-5xl leading-none md:text-7xl">
              VIEW <span className="text-brand-red">EVERY</span> MODEL
            </h1>
            <p className="max-w-2xl font-sora text-base text-neutral-400 md:text-lg">
              Use the interactive viewer to test shape and volume switching,
              then compare the shipped GLB variants side by side below.
            </p>
          </div>
          <Link
            href="/footscan"
            className="inline-flex items-center justify-center rounded-2xl bg-brand-red px-8 py-3 font-tanker text-lg text-black transition-colors hover:bg-brand-red/80"
          >
            BACK TO FOOT LAB
          </Link>
        </div>

        <div className="h-[60vh] w-full overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900">
          <FootModelViewer
            modelPath="/glb/foot.optimized.glb"
            shape="roman"
            volume="medium"
            showControls
          />
        </div>

        <div className="space-y-8">
          <ModelSection title="BASE MODELS" models={baseModels} />
          <ModelSection title="SHAPE MODELS" models={shapeModels} />
          <ModelSection title="VOLUME MODELS" models={volumeModels} />
        </div>
      </div>
    </main>
  );
}

function ModelSection({
  title,
  models,
}: {
  title: string;
  models: { label: string; description: string; modelPath: string; shape: string; volume: string }[];
}) {
  return (
    <div>
      <h2 className="font-tanker text-2xl mb-4">{title}</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {models.map((model) => (
          <ModelCard key={model.modelPath} model={model} />
        ))}
      </div>
    </div>
  );
}

function ModelCard({
  model,
}: {
  model: { label: string; description: string; modelPath: string; shape: string; volume: string };
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="mb-2 h-32 w-full overflow-hidden rounded-xl border border-neutral-700">
        <FootModelViewer
          modelPath={model.modelPath}
          shape={model.shape}
          volume={model.volume}
          showControls={false}
        />
      </div>
      <h3 className="font-tanker text-lg">{model.label}</h3>
      <p className="text-sm text-neutral-500">{model.description}</p>
      <p className="mt-1 font-mono text-xs text-neutral-600">{model.modelPath}</p>
    </div>
  );
}

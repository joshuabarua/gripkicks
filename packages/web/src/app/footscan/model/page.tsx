import Link from "next/link";
import FootModelViewer from "@/components/FootModelViewer";

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
  {
    label: "Germanic",
    description: "Shape-specific optimized foot model.",
    modelPath: "/glb/foot.germanic.optimized.glb",
    shape: "germanic",
    volume: "medium",
  },
  {
    label: "Celtic",
    description: "Shape-specific optimized foot model.",
    modelPath: "/glb/foot.celtic.optimized.glb",
    shape: "celtic",
    volume: "medium",
  },
];

const volumeModels = [
  {
    label: "Low volume",
    description: "Volume-specific optimized foot model.",
    modelPath: "/glb/foot.low.optimized.glb",
    shape: "roman",
    volume: "low",
  },
  {
    label: "Medium volume",
    description: "Volume-specific optimized foot model.",
    modelPath: "/glb/foot.medium.optimized.glb",
    shape: "roman",
    volume: "medium",
  },
  {
    label: "High volume",
    description: "Volume-specific optimized foot model.",
    modelPath: "/glb/foot.high.optimized.glb",
    shape: "roman",
    volume: "high",
  },
];

type ModelCard = {
  label: string;
  description: string;
  modelPath: string;
  shape: string;
  volume: string;
};

function ModelSection({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: ModelCard[];
}) {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30">
          {title}
        </p>
        <h2 className="font-tanker text-3xl text-white">{subtitle}</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.modelPath}
            className="overflow-hidden rounded-3xl border border-white/10 bg-neutral-950"
          >
            <div className="border-b border-white/10 px-5 py-4">
              <h3 className="font-tanker text-2xl text-white">{item.label}</h3>
              <p className="mt-2 font-sora text-sm text-neutral-400">
                {item.description}
              </p>
              <p className="mt-3 font-mono text-xs text-neutral-500">
                {item.modelPath}
              </p>
            </div>
            <FootModelViewer
              shape={item.shape}
              volume={item.volume}
              modelPath={item.modelPath}
              showControls={false}
              scale={1.2}
              containerClassName="relative h-[360px] w-full bg-slate-950"
            />
          </article>
        ))}
      </div>
    </section>
  );
}

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
              Use the interactive viewer to test shape and volume switching, then compare the shipped GLB variants side by side below.
            </p>
          </div>
          <Link
            href="/footscan"
            className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-sora text-sm text-white transition-colors hover:border-white/20 hover:bg-white/10"
          >
            Back to Foot Lab
          </Link>
        </div>

        <section className="space-y-5">
          <div className="space-y-2">
            <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30">
              Interactive Tester
            </p>
            <h2 className="font-tanker text-3xl text-white">
              Switch morph targets live
            </h2>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-950">
            <FootModelViewer containerClassName="relative h-[780px] w-full bg-slate-950" />
          </div>
        </section>

        <ModelSection
          title="Baseline"
          subtitle="Reference model"
          items={baseModels}
        />

        <ModelSection
          title="Shape models"
          subtitle="All toe-shape variants"
          items={shapeModels}
        />

        <ModelSection
          title="Volume models"
          subtitle="All fullness variants"
          items={volumeModels}
        />
      </div>
    </main>
  );
}

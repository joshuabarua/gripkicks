import { LoadingBar } from "@/components/ui/loading";

export default function StashLoading() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-black">
      <div className="text-center">
        <LoadingBar size="lg" />
        <span className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-600 mt-4 block">
          Loading sanctuary
        </span>
      </div>
    </div>
  );
}

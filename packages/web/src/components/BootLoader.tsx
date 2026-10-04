import { LoadingBar } from "@/components/ui/loading";

export default function BootLoader({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[10000] h-0.5 overflow-hidden" aria-hidden="true">
      <LoadingBar size="full" />
    </div>
  );
}

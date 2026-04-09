import { NextResponse } from "next/server";

const SHAPE_MODELS: Record<string, string> = {
  egyptian: "/glb/foot.egyptian.optimized.glb",
  roman: "/glb/foot.roman.optimized.glb",
  greek: "/glb/foot.greek.optimized.glb",
  germanic: "/glb/foot.germanic.optimized.glb",
  celtic: "/glb/foot.celtic.optimized.glb",
};

const VOLUME_MODELS: Record<string, string> = {
  low: "/glb/foot.low.optimized.glb",
  medium: "/glb/foot.medium.optimized.glb",
  high: "/glb/foot.high.optimized.glb",
};

export function GET(request: Request) {
  const url = new URL(request.url);
  const shape = (url.searchParams.get("shape") || "roman").toLowerCase();
  const volume = (url.searchParams.get("volume") || "medium").toLowerCase();

  const shapeModelPath = SHAPE_MODELS[shape] ?? SHAPE_MODELS["roman"];
  const volumeModelPath = VOLUME_MODELS[volume] ?? VOLUME_MODELS["medium"];
  const modelPath = shape !== "roman" ? shapeModelPath : volumeModelPath;

  return NextResponse.json({
    shape,
    volume,
    modelPath,
    shapeModelPath,
    volumeModelPath,
    inspectUrl: `/api/foot-model?shape=${shape}&volume=${volume}`,
  });
}

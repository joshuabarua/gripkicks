"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CanvasTexture } from "three";

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 320;
const FALLBACK_FONT_FAMILY = "sans-serif";

let brandFontLoadPromise: Promise<void> | null = null;

function loadBrandFont(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  if (brandFontLoadPromise) return brandFontLoadPromise;

  brandFontLoadPromise = (async () => {
    try {
      const font = new FontFace("GripKicksPicnic", "url(/fonts/Picnic-Regular.otf)");
      await font.load();
      document.fonts.add(font);
    } catch {
      // Custom font failed to load — canvas text draws with the fallback font instead.
    }
  })();

  return brandFontLoadPromise;
}

function drawTextToCanvas(
  text: string,
  fontFamily: string,
  color: string,
  letterSpacingPx: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${CANVAS_HEIGHT * 0.62}px ${fontFamily}`;
  if ("letterSpacing" in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${letterSpacingPx}px`;
  }
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + CANVAS_HEIGHT * 0.03);

  return canvas;
}

interface CanvasTextPlaneProps {
  text: string;
  position: [number, number, number];
  height: number;
  color?: string;
  letterSpacingPx?: number;
}

export default function CanvasTextPlane({
  text,
  position,
  height,
  color = "rgb(255, 252, 242)",
  letterSpacingPx = -4,
}: CanvasTextPlaneProps) {
  const [fontFamily, setFontFamily] = useState(FALLBACK_FONT_FAMILY);

  useEffect(() => {
    let cancelled = false;
    loadBrandFont().then(() => {
      if (!cancelled) setFontFamily("GripKickspicnic");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const texture = useMemo(() => {
    const canvas = drawTextToCanvas(text, fontFamily, color, letterSpacingPx);
    const tex = new CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [text, fontFamily, color, letterSpacingPx]);

  const width = height * (CANVAS_WIDTH / CANVAS_HEIGHT);

  return (
    <mesh position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

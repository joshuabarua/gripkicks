import { createHash } from "node:crypto";
import sharp from "sharp";

export const imageKey = (shoe) => `${shoe.brand}/${shoe.name}`;
export const shoeSlug = (value) => value.toLowerCase().replaceAll("+", "_plus").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

export function validateImagePaths(records) {
  const paths = new Map();
  for (const shoe of records) {
    const destination = `${shoe.brandKey}/${shoe.slug}`;
    if (paths.has(destination)) throw new Error(`Image path collision: ${paths.get(destination)} and ${imageKey(shoe)}`);
    paths.set(destination, imageKey(shoe));
  }
}
export const decode = (value) => value.replace(/&amp;/g, "&").replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').replace(/\\\//g, "/");
export const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

export function extractCandidates(html, sourcePage, shoe) {
  const candidates = new Map();
  const tokens = shoe.name.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 2);
  const add = (value, priority = 0) => {
    if (typeof value !== "string") return;
    try {
      const url = new URL(decode(value), sourcePage);
      if (url.protocol === "http:") url.protocol = "https:";
      const media = url.hostname === "shopapi.edelrid.com" && url.pathname.startsWith("/v1/media/image/");
      const ukc = url.hostname === "img.ukclimbing.com" && url.pathname.startsWith("/i/");
      if (url.protocol !== "https:" || (!/\.(png|jpe?g|webp)(?:$|\?)/i.test(url.href) && !media && !ukc)) return;
      if (/logo|favicon|icon|badge|banner|payment|sprite|review|placeholder|chart|diagram|groesse/i.test(url.pathname)) return;
      if (url.searchParams.has("width")) url.searchParams.set("width", "1200");
      const text = url.pathname.toLowerCase();
      const score = priority + tokens.filter((token) => text.includes(token)).length * 10 + (/side|lateral|profile/.test(text) ? 30 : 0) - (/sole|bottom|top|rear|back|suela|superior|trasera|escorzo/.test(text) ? 35 : 0);
      if (!candidates.has(url.href) || candidates.get(url.href).score < score) candidates.set(url.href, { url: url.href, score });
    } catch {}
  };
  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const visit = (object) => {
        if (!object || typeof object !== "object") return;
        if (object["@type"] === "Product" || object["@type"]?.includes?.("Product")) {
          for (const image of Array.isArray(object.image) ? object.image : [object.image]) add(typeof image === "object" ? image?.url : image, 100);
        }
        for (const value of Object.values(object)) if (typeof value === "object") Array.isArray(value) ? value.forEach(visit) : visit(value);
      };
      visit(JSON.parse(match[1]));
    } catch {}
  }
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (/og:image|twitter:image/.test(match[0])) add(match[0].match(/content=["']([^"']+)["']/i)?.[1], 80);
  }
  for (const tag of html.matchAll(/<img[^>]+>/gi)) {
    const priority = /field-slideshow-image/.test(tag[0]) ? 110 : tokens.filter((token) => tag[0].toLowerCase().includes(token)).length * 20;
    for (const match of tag[0].matchAll(/(?:src|data-src)=["']([^"']+)["']/gi)) add(match[1], priority);
  }
  for (const match of html.matchAll(/(?:src|data-src|data-large_image|href)=["']([^"']+)["']/gi)) add(match[1], match[1].includes("shopapi.edelrid.com/v1/media/image/") ? 120 : /data-large_image/.test(match[0]) ? 90 : 0);
  return [...candidates.values()].sort((a, b) => b.score - a.score).slice(0, 8);
}

export function buildImagePlan(records, current, production = false) {
  const database = new Map();
  for (const shoe of current) {
    const key = imageKey(shoe);
    database.set(key, [...(database.get(key) ?? []), shoe]);
  }
  return records.filter((shoe) => shoe.status === "approved" && shoe.imageUrl).map((shoe) => {
    const matches = database.get(imageKey(shoe)) ?? [];
    if (matches.length !== 1) throw new Error(`Expected one exact database match for ${imageKey(shoe)}`);
    const existing = matches[0];
    const preserve = Boolean(existing.imageUrl?.trim()) && existing.imageUrl !== shoe.imageUrl;
    if (production && !preserve && !shoe.devVerified) throw new Error(`Dev verification required for ${imageKey(shoe)}`);
    return { shoe, existing, preserve };
  });
}

export async function verifyTransparentImage(bytes, expectedHash) {
  if (expectedHash && sha256(bytes) !== expectedHash) throw new Error("Image bytes differ from reviewed asset");
  const image = sharp(bytes);
  const metadata = await image.metadata();
  if (metadata.format !== "png" || !metadata.hasAlpha || metadata.width < 250 || metadata.height < 100) throw new Error("Expected a transparent PNG at least 250 by 100 pixels");
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let transparent = 0;
  let foreground = 0;
  for (let index = 3; index < data.length; index += 4) {
    if (data[index] === 0) transparent++;
    if (data[index] > 240) foreground++;
  }
  const pixels = info.width * info.height;
  if (transparent / pixels < 0.1 || foreground / pixels < 0.02) throw new Error("Missing transparent background or shoe foreground");
  return { width: info.width, height: info.height, transparentPixels: transparent / pixels };
}

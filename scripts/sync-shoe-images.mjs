import "dotenv/config";
import ImageKit from "imagekit";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const BRAND = process.argv[2];
const FOLDER = process.argv[3];

if (!BRAND || !FOLDER) {
  console.error("Usage: node scripts/sync-shoe-images.mjs <brand> <imagekit-folder-path>");
  console.error("Example: node scripts/sync-shoe-images.mjs Scarpa gripkicks/imgs/shoes/scarpa/");
  process.exit(1);
}

const FILENAME_TO_NAME = {
  drago: "Drago",
  dragoLV: "Drago LV",
  dragoxt: "Drago XT",
  dragoxtlv: "Drago XT LV",
  instinctVS: "Instinct VS",
  instinctvslace: "Instinct VS Lace",
  instinctVSR: "Instinct VSR",
  instinctvsrlv: "Instinct VSR LV",
  instincts: "Instinct S",
  instinctle: "Instinct LE",
  furiaair: "Furia Air",
  furiaairls: "Furia Air LS",
  furias: "Furia S",
  vaporV: "Vapor V",
  vapors: "Vapor S",
  vapourLACE: "Vapor Lace",
  vapourVLV: "Vapour LV",
  vapourVTORQUOISE: "Vapour V Turquoise",
  veloce: "Veloce",
  velocelace: "Veloce Lace",
  velocityV: "Velocity V",
  maestro: "Maestro",
  chimera: "Chimera",
  origin: "Origin",
  originORANGE: "Origin Orange",
  originVS: "Origin VS",
  originVSTORQUOISE: "Origin VS Turquoise",
  quantic: "Quantic",
  quantixsf: "Quantix SF",
  reflex: "Reflex",
  reflexvs: "Reflex VS",
  reflexv: "Reflex V",
  booster: "Booster",
  boostic: "Boostic",
  generator: "Generator",
  generatormidlace: "Generator Mid Lace",
  mago: "Mago",
  pikij: "Pikij",
  arpiav: "Arpia V",
  boosticR: "Boostic R",
  instinctS1: "Instinct S",
  vapourS: "Vapor S",
};

const SHOE_DEFAULTS = {
  Scarpa: {
    Drago: { aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "medium", footShapeCompat: ["egyptian", "roman", "greek"] },
    "Drago LV": { aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "low", footShapeCompat: ["egyptian", "greek"] },
    "Drago XT": { aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "medium", footShapeCompat: ["egyptian", "roman", "greek"] },
    "Drago XT LV": { aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "low", footShapeCompat: ["egyptian", "greek"] },
    "Instinct VS": { aggressiveness: "aggressive", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", footShapeCompat: ["egyptian", "roman"] },
    "Instinct VS Lace": { aggressiveness: "aggressive", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", footShapeCompat: ["egyptian", "roman", "greek"] },
    "Instinct VSR": { aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "medium", footShapeCompat: ["egyptian", "roman"] },
    "Instinct VSR LV": { aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "low", footShapeCompat: ["egyptian", "greek"] },
    "Instinct S": { aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", footShapeCompat: ["egyptian", "roman", "greek"] },
    "Instinct LE": { aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", footShapeCompat: ["egyptian", "roman", "greek"] },
    "Furia Air": { aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "competition", volume: "low", footShapeCompat: ["egyptian", "greek"] },
    "Furia Air LS": { aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "competition", volume: "low", footShapeCompat: ["egyptian", "greek"] },
    "Furia S": { aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "low", footShapeCompat: ["egyptian", "greek"] },
    "Vapor V": { aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", footShapeCompat: ["egyptian", "roman", "greek"] },
    "Vapor S": { aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", footShapeCompat: ["egyptian", "roman", "greek"] },
    "Vapor Lace": { aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "trad", volume: "medium", footShapeCompat: ["egyptian", "roman", "greek", "germanic"] },
    "Vapour LV": { aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport", volume: "low", footShapeCompat: ["egyptian", "greek"] },
    "Vapour V Turquoise": { aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", footShapeCompat: ["egyptian", "roman", "greek"] },
    "Veloce": { aggressiveness: "flat", stiffness: "medium", climbingDiscipline: "gym", volume: "high", footShapeCompat: ["egyptian", "roman", "greek", "germanic", "celtic"] },
    "Veloce Lace": { aggressiveness: "flat", stiffness: "medium", climbingDiscipline: "gym", volume: "high", footShapeCompat: ["egyptian", "roman", "greek", "germanic", "celtic"] },
    "Velocity V": { aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", footShapeCompat: ["egyptian", "roman", "greek"] },
    "Maestro": { aggressiveness: "aggressive", stiffness: "stiff", climbingDiscipline: "sport", volume: "medium", footShapeCompat: ["egyptian", "roman"] },
    "Chimera": { aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "low", footShapeCompat: ["egyptian", "greek"] },
    "Origin": { aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", footShapeCompat: ["egyptian", "roman", "greek"] },
    "Origin Orange": { aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", footShapeCompat: ["egyptian", "roman", "greek"] },
    "Origin VS": { aggressiveness: "aggressive", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", footShapeCompat: ["egyptian", "roman"] },
    "Origin VS Turquoise": { aggressiveness: "aggressive", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", footShapeCompat: ["egyptian", "roman"] },
    "Quantic": { aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "low", footShapeCompat: ["egyptian", "greek"] },
    "Quantix SF": { aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "competition", volume: "low", footShapeCompat: ["egyptian", "greek"] },
    "Reflex": { aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "gym", volume: "high", footShapeCompat: ["egyptian", "roman", "greek", "germanic", "celtic"] },
    "Reflex VS": { aggressiveness: "aggressive", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", footShapeCompat: ["egyptian", "roman"] },
    "Reflex V": { aggressiveness: "aggressive", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", footShapeCompat: ["egyptian", "roman"] },
    "Booster": { aggressiveness: "flat", stiffness: "soft", climbingDiscipline: "gym", volume: "high", footShapeCompat: ["egyptian", "roman", "greek", "germanic", "celtic"] },
    "Boostic": { aggressiveness: "aggressive", stiffness: "stiff", climbingDiscipline: "sport", volume: "medium", footShapeCompat: ["egyptian", "roman"] },
    "Boostic R": { aggressiveness: "aggressive", stiffness: "stiff", climbingDiscipline: "sport", volume: "medium", footShapeCompat: ["egyptian", "roman"] },
    "Generator": { aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", footShapeCompat: ["egyptian", "roman", "greek"] },
    "Generator Mid Lace": { aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "trad", volume: "medium", footShapeCompat: ["egyptian", "roman", "greek", "germanic"] },
    "Mago": { aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "low", footShapeCompat: ["egyptian", "greek"] },
    "Pikij": { aggressiveness: "flat", stiffness: "soft", climbingDiscipline: "gym", volume: "high", footShapeCompat: ["egyptian", "roman", "greek", "germanic", "celtic"] },
    "Arpia V": { aggressiveness: "aggressive", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", footShapeCompat: ["egyptian", "roman"] },
  },
};

function parseFilename(filename) {
  const base = filename.replace(/\.(png|jpg|jpeg|webp)$/i, "");
  const match = base.match(/^(.+?)_([mwk])(\d+)$/);
  if (!match) return null;

  const [, slugRaw, genderCode] = match;
  const slug = slugRaw.toLowerCase();
  const genderMap = { m: "men", w: "women", k: "kids" };
  return { slug, slugRaw, gender: genderMap[genderCode] };
}

function resolveShoeName(slugRaw) {
  if (FILENAME_TO_NAME[slugRaw]) return FILENAME_TO_NAME[slugRaw];
  const lower = slugRaw.toLowerCase();
  for (const [key, value] of Object.entries(FILENAME_TO_NAME)) {
    if (key.toLowerCase() === lower) return value;
  }
  return null;
}

async function main() {
  const imagekit = new ImageKit({
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  });

  const files = await imagekit.listFiles({ path: FOLDER, limit: 1000 });
  console.log(`Found ${files.length} files in ${FOLDER}`);

  const brandDefaults = SHOE_DEFAULTS[BRAND] ?? {};
  const shoesByName = new Map();

  for (const file of files) {
    const parsed = parseFilename(file.name);
    if (!parsed) {
      console.warn(`Skipping unparseable filename: ${file.name}`);
      continue;
    }

    const shoeName = resolveShoeName(parsed.slugRaw);
    if (!shoeName) {
      console.warn(`No name mapping for slug: ${parsed.slugRaw} (file: ${file.name})`);
      continue;
    }

    const isVariantImage = parsed.gender === "women" || parsed.gender === "kids";
    const variantSuffix = parsed.gender === "women" ? " Women's" : parsed.gender === "kids" ? " Kids" : "";
    const fullName = isVariantImage && !shoeName.endsWith(variantSuffix) ? `${shoeName}${variantSuffix}` : shoeName;

    if (shoesByName.has(fullName)) continue;

    const defaults = brandDefaults[fullName] || brandDefaults[shoeName] || {};
    shoesByName.set(fullName, {
      name: fullName,
      imageUrl: file.url,
      gender: parsed.gender,
      ...defaults,
    });
  }

  const shoes = Array.from(shoesByName.values());
  console.log(`Prepared ${shoes.length} shoes for upsert`);

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
  if (!convexUrl) throw new Error("Missing CONVEX_URL");

  const client = new ConvexHttpClient(convexUrl);
  const result = await client.mutation(api.shoes.bulkUpsertByBrand, {
    brand: BRAND,
    shoes,
  });

  console.log(`\n✓ Updated: ${result.updatedCount}`);
  console.log(`✓ Created: ${result.createdCount}`);
  if (result.created.length > 0) {
    console.log("Created:", result.created.join(", "));
  }
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});

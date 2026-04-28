import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import ImageKit from "imagekit";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const BRAND_KEY = process.argv[2];
const DRY_RUN = process.argv.includes("--dry-run");

if (!BRAND_KEY) {
  console.error("Usage: node scripts/sync-shoe-images.mjs <brand-key> [--dry-run]");
  console.error("Example: node scripts/sync-shoe-images.mjs scarpa");
  console.error("\nBrand key must match a file in data/shoe-catalog/<brand-key>.json");
  process.exit(1);
}

const GENDER_SUFFIX = {
  men: "",
  women: " Women's",
  kids: " Kids",
  unisex: "",
};

const GENDER_FROM_CODE = {
  m: "men",
  w: "women",
  k: "kids",
  u: "unisex",
};

function defaultParseFilename(filename) {
  const base = filename.replace(/\.(png|jpg|jpeg|webp)$/i, "");
  const match = base.match(/^(.+?)_([mwku])(\d+)$/);
  if (!match) return null;
  const [, slug, genderCode] = match;
  return { slug, gender: GENDER_FROM_CODE[genderCode] };
}

function normalizeSlug(slug) {
  return slug.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function resolveShoeName(slug, config) {
  if (config.filenameToName?.[slug]) return config.filenameToName[slug];
  const normalized = normalizeSlug(slug);
  for (const [key, value] of Object.entries(config.filenameToName ?? {})) {
    if (normalizeSlug(key) === normalized) return value;
  }
  for (const knownName of Object.keys(config.defaults ?? {})) {
    if (normalizeSlug(knownName) === normalized) return knownName;
  }
  return null;
}

function loadBrandCatalog(key) {
  const catalogPath = path.resolve(`data/shoe-catalog/${key}.json`);
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`Missing brand catalog at ${catalogPath}`);
  }
  const raw = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  if (!raw.brand) throw new Error(`${catalogPath} must contain 'brand'`);
  if (!raw.imagekitFolder) throw new Error(`${catalogPath} must contain 'imagekitFolder'`);

  const defaults = {};
  for (const shoe of raw.shoes ?? []) {
    const { name, ...attrs } = shoe;
    if (name) defaults[name] = attrs;
  }

  return {
    brand: raw.brand,
    imagekitFolder: raw.imagekitFolder,
    filenameToName: raw.filenameToName ?? {},
    defaults,
    parseFilename: defaultParseFilename,
  };
}

async function listImagekitFiles(folder) {
  const imagekit = new ImageKit({
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  });
  return imagekit.listFiles({ path: folder, limit: 1000 });
}

function buildShoePayloads(files, config) {
  const seen = new Set();
  const shoes = [];
  const warnings = [];

  for (const file of files) {
    const parsed = config.parseFilename(file.name);
    if (!parsed) {
      warnings.push(`Unparseable filename: ${file.name}`);
      continue;
    }

    const baseName = resolveShoeName(parsed.slug, config);
    if (!baseName) {
      warnings.push(`No name mapping for slug '${parsed.slug}' (file: ${file.name})`);
      continue;
    }

    const suffix = GENDER_SUFFIX[parsed.gender] ?? "";
    const fullName = suffix && !baseName.endsWith(suffix) ? `${baseName}${suffix}` : baseName;

    if (seen.has(fullName)) continue;
    seen.add(fullName);

    const defaults = config.defaults[fullName] ?? config.defaults[baseName] ?? {};
    shoes.push({
      name: fullName,
      imageUrl: file.url,
      gender: parsed.gender,
      ...defaults,
    });
  }

  return { shoes, warnings };
}

async function main() {
  const config = loadBrandCatalog(BRAND_KEY);
  console.log(`\n━━ Syncing ${config.brand} ━━`);
  console.log(`Folder: ${config.imagekitFolder}`);

  const files = await listImagekitFiles(config.imagekitFolder);
  console.log(`Found ${files.length} files`);

  const { shoes, warnings } = buildShoePayloads(files, config);
  warnings.forEach((w) => console.warn(`⚠ ${w}`));
  console.log(`Prepared ${shoes.length} shoes`);

  if (DRY_RUN) {
    console.log("\n-- DRY RUN --");
    shoes.forEach((s) => console.log(`  ${s.name}  [${s.gender}]  ${s.imageUrl}`));
    return;
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
  if (!convexUrl) throw new Error("Missing NEXT_PUBLIC_CONVEX_URL or CONVEX_URL");

  const client = new ConvexHttpClient(convexUrl);
  const result = await client.mutation(api.shoes.bulkUpsertByBrand, {
    brand: config.brand,
    shoes,
  });

  console.log(`\n✓ Updated: ${result.updatedCount}`);
  console.log(`✓ Created: ${result.createdCount}`);
  if (result.created.length > 0) {
    console.log(`Created: ${result.created.join(", ")}`);
  }
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});

import { ConvexClient, ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

type Gender = "men" | "women" | "kids" | "unisex";

type SourceRubberTechnology = {
  _id: string;
  brand: string;
  compound: string;
  stickiness: string;
  durability: string;
};

type SourceShoe = {
  _id: string;
  name: string;
  brand: string;
  imageUrl?: string | null;
  slug?: string | null;
  gender?: Gender | null;
  aggressiveness: string;
  stiffness: string;
  climbingDiscipline: string;
  volume: string;
  rubberTechnologyId?: string | null;
  avgComfortScore?: number;
  avgPerformanceRating?: number;
  avgDurabilityRating?: number;
  totalRatings?: number;
  rubberTechnology?: SourceRubberTechnology | null;
  footShapeCompat?: {
    _id: string;
    footShape: "egyptian" | "roman" | "greek" | "germanic" | "celtic";
    shoeId: string;
  }[];
};

const sourceUrl = process.env.SOURCE_CONVEX_URL ?? "https://peaceful-marten-189.convex.cloud";
const targetUrl = process.env.TARGET_CONVEX_URL;
const dryRun = process.env.DRY_RUN !== "false";

if (!targetUrl) {
  throw new Error("Missing TARGET_CONVEX_URL env var");
}

const sourceClient = new ConvexClient(sourceUrl);
const targetClient = new ConvexHttpClient(targetUrl);

function shoeKey(shoe: Pick<SourceShoe, "brand" | "name" | "gender">) {
  return [shoe.brand.trim().toLowerCase(), shoe.name.trim().toLowerCase(), (shoe.gender ?? "").trim().toLowerCase()].join("::");
}

async function loadSourceShoes() {
  const shoes = (await sourceClient.query(api.shoes.listAll, {})) as SourceShoe[];
  const detailedShoes: SourceShoe[] = [];

  for (const shoe of shoes) {
    const detailed = (await sourceClient.query(api.shoes.getById, { id: shoe._id as never })) as SourceShoe | null;
    if (detailed) {
      detailedShoes.push(detailed);
    }
  }

  return detailedShoes;
}

async function loadTargetShoes() {
  return (await targetClient.query(api.shoes.listAll, {})) as SourceShoe[];
}

async function ensureRubberTechnology(rubberTechnology: SourceRubberTechnology | null | undefined) {
  if (!rubberTechnology) {
    return undefined;
  }

  if (dryRun) {
    return `dry-run:${rubberTechnology.brand}:${rubberTechnology.compound}`;
  }

  return (await targetClient.mutation(api.rubberTechnologies.createOrGet, {
    brand: rubberTechnology.brand,
    compound: rubberTechnology.compound,
    stickiness: rubberTechnology.stickiness,
    durability: rubberTechnology.durability,
  })) as string;
}

async function migrate() {
  console.log(`Source Convex: ${sourceUrl}`);
  console.log(`Target Convex: ${targetUrl}`);
  console.log(`Mode: ${dryRun ? "dry-run" : "write"}`);

  const [sourceShoes, targetShoes] = await Promise.all([
    loadSourceShoes(),
    loadTargetShoes(),
  ]);

  const existingTargetKeys = new Set(targetShoes.map((shoe) => shoeKey(shoe)));

  let skipped = 0;
  let created = 0;
  let compatCreated = 0;

  for (const sourceShoe of sourceShoes) {
    const key = shoeKey(sourceShoe);

    if (existingTargetKeys.has(key)) {
      skipped += 1;
      console.log(`- Skipping existing shoe: ${sourceShoe.brand} ${sourceShoe.name}${sourceShoe.gender ? ` (${sourceShoe.gender})` : ""}`);
      continue;
    }

    const rubberTechnologyId = await ensureRubberTechnology(sourceShoe.rubberTechnology ?? undefined);

    if (dryRun) {
      created += 1;
      compatCreated += sourceShoe.footShapeCompat?.length ?? 0;
      console.log(`+ Would create shoe: ${sourceShoe.brand} ${sourceShoe.name}${sourceShoe.gender ? ` (${sourceShoe.gender})` : ""}`);
      continue;
    }

    const createdShoeId = (await targetClient.mutation(api.shoes.create, {
      name: sourceShoe.name,
      brand: sourceShoe.brand,
      imageUrl: sourceShoe.imageUrl ?? undefined,
      slug: sourceShoe.slug ?? undefined,
      gender: sourceShoe.gender ?? undefined,
      aggressiveness: sourceShoe.aggressiveness,
      stiffness: sourceShoe.stiffness,
      climbingDiscipline: sourceShoe.climbingDiscipline,
      volume: sourceShoe.volume,
      rubberTechnologyId: rubberTechnologyId as never,
      footShapeCompat: (sourceShoe.footShapeCompat ?? []).map((entry) => entry.footShape),
    })) as string;

    existingTargetKeys.add(key);
    created += 1;
    compatCreated += sourceShoe.footShapeCompat?.length ?? 0;
    console.log(`+ Created shoe: ${sourceShoe.brand} ${sourceShoe.name}${sourceShoe.gender ? ` (${sourceShoe.gender})` : ""} -> ${createdShoeId}`);
  }

  console.log("\nMigration summary");
  console.log(`Source shoes: ${sourceShoes.length}`);
  console.log(`Target shoes before: ${targetShoes.length}`);
  console.log(`Created shoes: ${created}`);
  console.log(`Skipped existing shoes: ${skipped}`);
  console.log(`Foot shape compatibility rows created: ${compatCreated}`);
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});

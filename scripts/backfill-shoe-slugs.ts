import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

type Gender = "men" | "women" | "kids" | "unisex" | undefined;

const genderSuffix: Record<Exclude<Gender, undefined>, string> = {
  men: "-m",
  women: "-w",
  kids: "-k",
  unisex: "-u",
};

const client = new ConvexClient(process.env.CONVEX_URL ?? "https://peaceful-marten-189.convex.cloud");

const normalizeBrand = (brand: string) =>
  brand
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

const normalizeName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const suffixForGender = (gender: Gender) => (gender ? genderSuffix[gender] ?? "" : "");

function buildSlug(brand: string, name: string, gender?: Gender) {
  const brandFolder = normalizeBrand(brand);
  const shoeSegment = normalizeName(name) || "shoe";
  return `${brandFolder}/${shoeSegment}${suffixForGender(gender)}`;
}

async function backfillSlugs() {
  console.log("Fetching shoes...");
  const shoes = await client.query(api.shoes.list, {});
  let updated = 0;
  let skipped = 0;

  for (const shoe of shoes) {
    const slug = buildSlug(shoe.brand, shoe.name, shoe.gender as Gender);

    if (shoe.slug && shoe.slug === slug) {
      skipped += 1;
      continue;
    }

    try {
      await client.mutation(api.shoes.update, { id: shoe._id, slug });
      updated += 1;
      console.log(`✓ ${shoe.brand} ${shoe.name} -> ${slug}`);
    } catch (error) {
      console.error(`✗ Failed to set slug for ${shoe.brand} ${shoe.name}:`, error);
    }
  }

  console.log(`\nDone. Updated ${updated} shoes (${skipped} already had slugs).`);
}

backfillSlugs().catch((error) => {
  console.error(error);
  process.exit(1);
});

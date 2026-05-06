import "dotenv/config";
import ImageKit from "imagekit";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const DRY_RUN = process.argv.includes("--dry-run");
const SCARPA_FOLDER = "gripkicks/imgs/shoes/scarpa/";
const exactFileByShoeName = {
  Chimera: "chimera_m1.png",
  Drago: "drago_m2.png",
  "Furia Air": "furiaair_m1.png",
  "Furia S": "furiaS_m1.png",
  "Instinct VS": "instinctVS_m1.png",
  "Instinct VSR": "instinctVSR_m1.png",
  Maestro: "maestro_w1.png",
  "Vapor Lace": "vapourLACE_m1.png",
  "Vapor V": "vaporV_m2.png",
  Veloce: "veloce_m1.png",
};

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

async function main() {
  const imagekit = new ImageKit({
    urlEndpoint: requireEnv("IMAGEKIT_URL_ENDPOINT"),
    publicKey: requireEnv("IMAGEKIT_PUBLIC_KEY"),
    privateKey: requireEnv("IMAGEKIT_PRIVATE_KEY"),
  });
  const files = await imagekit.listFiles({ path: SCARPA_FOLDER, limit: 1000 });
  const fileByName = new Map(files.map((file) => [file.name, file]));
  const shoes = Object.entries(exactFileByShoeName).map(([name, fileName]) => {
    const file = fileByName.get(fileName);
    if (!file) throw new Error(`Missing ImageKit file ${fileName}`);
    return { name, imageUrl: file.url };
  });

  console.log(`Prepared ${shoes.length} SCARPA image assignments`);
  shoes.forEach((shoe) => console.log(`${shoe.name}: ${shoe.imageUrl}`));

  if (DRY_RUN) return;

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
  if (!convexUrl) throw new Error("Missing NEXT_PUBLIC_CONVEX_URL or CONVEX_URL");
  const client = new ConvexHttpClient(convexUrl);
  const result = await client.mutation(api.shoes.bulkUpsertByBrand, {
    brand: "Scarpa",
    shoes,
  });

  console.log(`Updated: ${result.updatedCount}`);
  console.log(`Created: ${result.createdCount}`);
  if (result.created.length > 0) {
    console.log(`Created: ${result.created.join(", ")}`);
  }
}

main().catch((error) => {
  console.error("Failed:", error);
  process.exit(1);
});

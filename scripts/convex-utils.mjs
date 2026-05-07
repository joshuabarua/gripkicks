import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

export function createConvexClient() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
  if (!convexUrl) throw new Error("Missing NEXT_PUBLIC_CONVEX_URL or CONVEX_URL");
  return new ConvexHttpClient(convexUrl);
}

export async function bulkUpsertShoesByBrand(brand, shoes) {
  const client = createConvexClient();
  const result = await client.mutation(api.shoes.bulkUpsertByBrand, {
    brand,
    shoes,
  });
  console.log(`Updated: ${result.updatedCount}`);
  console.log(`Created: ${result.createdCount}`);
  if (result.created.length > 0) {
    console.log(`Created: ${result.created.join(", ")}`);
  }
  return result;
}

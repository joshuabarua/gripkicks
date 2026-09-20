import { MutationCtx, QueryCtx } from "../_generated/server";
import { deriveModelName, deriveVariantLabel } from "./helpers";
import { resolveParentModelId } from "../shoeHelpers";

export async function runBackfillVariantMetadata(ctx: MutationCtx) {
  const shoes = await ctx.db.query("shoes").collect();
  let updatedCount = 0;

  for (const shoe of shoes) {
    const modelName = deriveModelName(shoe.name);
    const variantLabel =
      shoe.variantLabel || deriveVariantLabel(shoe.name, shoe.gender);
    const parentModelId =
      shoe.parentModelId ||
      (await resolveParentModelId(
        ctx,
        shoe.brand,
        modelName,
        variantLabel,
        shoe._id,
      ));

    await ctx.db.patch(shoe._id, {
      modelName,
      variantLabel,
      parentModelId,
    });
    updatedCount += 1;
  }

  return { updatedCount };
}

export async function buildMissingRubberTechnologyReport(ctx: QueryCtx) {
  const shoes = await ctx.db.query("shoes").collect();
  const rubberTechnologies = await ctx.db.query("rubberTechnologies").collect();

  const missingShoes = shoes.filter((shoe) => !shoe.rubberTechnologyId);

  return missingShoes.map((shoe) => {
    const brandMatches = rubberTechnologies.filter(
      (rubberTechnology) =>
        rubberTechnology.brand === (shoe.brand ?? "Unknown brand"),
    );

    return {
      shoeId: shoe._id,
      name: shoe.name ?? "Unknown shoe",
      brand: shoe.brand ?? "Unknown brand",
      modelName: shoe.modelName ?? null,
      brandMatchCount: brandMatches.length,
      brandMatches: brandMatches.map((rubberTechnology) => ({
        id: rubberTechnology._id,
        compound: rubberTechnology.compound ?? "Unknown compound",
      })),
    };
  });
}

export async function runBackfillMissingRubberTechnology(ctx: MutationCtx) {
  const shoes = await ctx.db.query("shoes").collect();
  const rubberTechnologies = await ctx.db.query("rubberTechnologies").collect();

  let updatedCount = 0;
  const skipped: Array<{ shoeId: string; reason: string }> = [];

  for (const shoe of shoes) {
    if (shoe.rubberTechnologyId) {
      continue;
    }

    const brandMatches = rubberTechnologies.filter(
      (rubberTechnology) => rubberTechnology.brand === shoe.brand,
    );

    if (brandMatches.length === 1) {
      const match = brandMatches[0];
      if (!match) {
        continue;
      }
      await ctx.db.patch(shoe._id, {
        rubberTechnologyId: match._id,
      });
      updatedCount += 1;
      continue;
    }

    skipped.push({
      shoeId: shoe._id,
      reason:
        brandMatches.length === 0
          ? `No rubber technology found for brand ${shoe.brand}`
          : `Multiple rubber technologies found for brand ${shoe.brand}`,
    });
  }

  return {
    updatedCount,
    skipped,
  };
}

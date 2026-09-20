import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internalMutation, query, mutation } from "./_generated/server";
import { footShapeValidator, genderValidator, shoeOfficialSpecsValidator, deriveModelName, deriveVariantLabel, ensureRubberTechnologyExists, commonShoeFieldsValidator, optionalShoeFieldsValidator } from "./utils/helpers";
import { findParentModel } from "./shoeHelpers";
import { deleteUserShoesForShoe } from "./userShoes";
import { requireAdmin } from "./authorization";

async function enrichShoesWithRubber(ctx: any, shoes: any[]) {
  return await Promise.all(
    shoes.map(async (shoe) => {
      const rubberTechnology = shoe.rubberTechnologyId
        ? await ctx.db.get(shoe.rubberTechnologyId)
        : null;
      return { ...shoe, rubberTechnology };
    }),
  );
}

function sortShoesByName(shoes: any[]) {
  return shoes.sort((a, b) => {
    const brandCompare = a.brand.localeCompare(b.brand);
    if (brandCompare !== 0) return brandCompare;
    return a.name.localeCompare(b.name);
  });
}

function clampScore(value: number) {
  return Math.max(1, Math.min(10, Number(value.toFixed(1))));
}

function getSoleThickness(sole?: string) {
  const match = sole?.match(/(\d+(?:\.\d+)?)\s*mm/i);
  return match?.[1] ? Number(match[1]) : undefined;
}

function calculateEnrichmentScores(
  shoe: {
    aggressiveness: string;
    stiffness: string;
    climbingDiscipline: string;
  },
  specs: {
    closure?: string;
    sole?: string;
    rigidity?: string;
  },
) {
  const aggressiveness = shoe.aggressiveness.toLowerCase();
  const stiffness = shoe.stiffness.toLowerCase();
  const discipline = shoe.climbingDiscipline.toLowerCase();
  const thickness = getSoleThickness(specs.sole);
  let comfort = aggressiveness === "aggressive" ? 4 : aggressiveness === "moderate" ? 6 : 7;
  let performance = aggressiveness === "aggressive" ? 8 : aggressiveness === "moderate" ? 6 : 5;
  let durability = 5;

  if (discipline === "competition") {
    comfort -= 1;
    performance += 2;
  } else if (discipline === "bouldering") {
    comfort += 0.5;
    performance += 0.5;
  } else if (discipline === "sport") {
    performance += 1;
    durability -= 0.5;
  } else if (discipline === "trad") {
    comfort += 1;
    performance -= 0.5;
    durability += 1;
  } else if (discipline === "gym") {
    comfort += 0.5;
    durability -= 0.5;
  }

  if (stiffness === "soft") {
    comfort += 1;
    performance -= 0.5;
  } else if (stiffness === "stiff") {
    comfort -= 0.5;
    performance += 1;
    durability += 0.5;
  }

  if (thickness !== undefined) {
    if (thickness <= 3) durability -= 0.5;
    if (thickness >= 4.5) durability += 0.5;
  }

  const stiffnessScore = stiffness === "soft" ? 3 : stiffness === "stiff" ? 8 : 5.5;
  const aggressionScore = aggressiveness === "aggressive" ? 9 : aggressiveness === "moderate" ? 6 : 3;
  const sensitivity = thickness !== undefined
    ? 10 - Math.min(7, thickness * 1.4) + (stiffness === "soft" ? 1 : 0)
    : 10 - stiffnessScore;

  return {
    comfort: clampScore(comfort),
    performance: clampScore(performance),
    durability: clampScore(durability),
    sensitivity: clampScore(sensitivity),
    edging: clampScore(stiffnessScore * 0.7 + aggressionScore * 0.3),
    smearing: clampScore((10 - stiffnessScore) * 0.65 + (10 - aggressionScore) * 0.35),
    toeHooking: clampScore(aggressionScore * 0.75 + (stiffness === "soft" ? 2 : 1)),
    heelHooking: clampScore(aggressionScore * 0.7 + performance * 0.3),
  };
}

async function resolveParentModelId(
  ctx: any,
  brand: string,
  modelName: string,
  variantLabel?: string,
  currentId?: string,
) {
  if (!variantLabel) {
    return undefined;
  }

  const candidates = await ctx.db
    .query("shoes")
    .withIndex("by_brand_modelName", (q: any) =>
      q.eq("brand", brand).eq("modelName", modelName),
    )
    .collect();

  return candidates.find((candidate: any) => {
    if (currentId && candidate._id === currentId) {
      return false;
    }
    return !candidate.variantLabel;
  })?._id;
}

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("shoes")
      .withIndex("by_brand_name")
      .order("asc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: await enrichShoesWithRubber(ctx, result.page),
    };
  },
});

export const listAll = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const shoes = await ctx.db.query("shoes").collect();
    const shoesWithRubber = await enrichShoesWithRubber(ctx, shoes);
    const sorted = sortShoesByName(shoesWithRubber);
    return args.limit ? sorted.slice(0, args.limit) : sorted;
  },
});

export const listBrands = query({
  args: {},
  handler: async (ctx) => {
    const shoes = await ctx.db.query("shoes").collect();
    return [...new Set(shoes.map((shoe) => shoe.brand))].sort();
  },
});

export const searchCatalog = query({
  args: {
    paginationOpts: paginationOptsValidator,
    searchTerm: v.optional(v.string()),
    brand: v.optional(v.string()),
    gender: v.optional(genderValidator),
  },
  handler: async (ctx, args) => {
    const searchTerm = args.searchTerm?.trim();
    let result;

    if (searchTerm) {
      result = await ctx.db
        .query("shoes")
        .withSearchIndex("search_shoes", (q) => {
          let search = q.search("name", searchTerm);
          if (args.brand) search = search.eq("brand", args.brand);
          if (args.gender) search = search.eq("gender", args.gender);
          return search;
        })
        .paginate(args.paginationOpts);
    } else if (args.brand && args.gender) {
      result = await ctx.db
        .query("shoes")
        .withIndex("by_brand_gender_name", (q) =>
          q.eq("brand", args.brand!).eq("gender", args.gender!),
        )
        .order("asc")
        .paginate(args.paginationOpts);
    } else if (args.brand) {
      result = await ctx.db
        .query("shoes")
        .withIndex("by_brand_name", (q) => q.eq("brand", args.brand!))
        .order("asc")
        .paginate(args.paginationOpts);
    } else if (args.gender) {
      result = await ctx.db
        .query("shoes")
        .withIndex("by_gender_name", (q) => q.eq("gender", args.gender!))
        .order("asc")
        .paginate(args.paginationOpts);
    } else {
      result = await ctx.db
        .query("shoes")
        .withIndex("by_brand_name")
        .order("asc")
        .paginate(args.paginationOpts);
    }

    return {
      ...result,
      page: await enrichShoesWithRubber(ctx, result.page),
    };
  },
});

export const getById = query({
  args: { id: v.id("shoes") },
  handler: async (ctx, args) => {
    const shoe = await ctx.db.get(args.id);
    if (!shoe) return null;

    const rubberTechnology = shoe.rubberTechnologyId
      ? await ctx.db.get(shoe.rubberTechnologyId)
      : null;

    const footShapeCompat = await ctx.db
      .query("footShapeCompat")
      .withIndex("by_shoe", (q) => q.eq("shoeId", args.id))
      .collect();

    return { ...shoe, rubberTechnology, footShapeCompat };
  },
});

export const getByBrand = query({
  args: { brand: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("shoes")
      .withIndex("by_brand", (q) => q.eq("brand", args.brand))
      .collect();
  },
});

export const getCompatibleWithFootShape = query({
  args: { footShape: footShapeValidator },
  handler: async (ctx, args) => {
    const compatEntries = await ctx.db
      .query("footShapeCompat")
      .withIndex("by_footShape", (q) => q.eq("footShape", args.footShape))
      .collect();

    const shoes = await Promise.all(
      compatEntries.map(async (entry) => {
        return await ctx.db.get(entry.shoeId);
      }),
    );

    return shoes.filter(Boolean);
  },
});

export const create = mutation({
  args: {
    ...commonShoeFieldsValidator,
    stiffness: v.string(),
    climbingDiscipline: v.string(),
    volume: v.string(),
    rubberTechnologyId: v.id("rubberTechnologies"),
    footShapeCompat: v.optional(v.array(footShapeValidator)),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const {
      footShapeCompat,
      modelName,
      variantLabel,
      parentModelId,
      ...shoeData
    } = args;
    const normalizedModelName = modelName?.trim() || deriveModelName(args.name);
    const normalizedVariantLabel =
      variantLabel?.trim() || deriveVariantLabel(args.name, args.gender);
    const normalizedParentModelId =
      parentModelId ||
      (await resolveParentModelId(
        ctx,
        args.brand,
        normalizedModelName,
        normalizedVariantLabel,
      ));

    await ensureRubberTechnologyExists(ctx, args.rubberTechnologyId);

    const shoeId = await ctx.db.insert("shoes", {
      ...shoeData,
      modelName: normalizedModelName,
      ...(normalizedVariantLabel !== undefined ? { variantLabel: normalizedVariantLabel } : {}),
      ...(normalizedParentModelId !== undefined ? { parentModelId: normalizedParentModelId } : {}),
    });

    // Add foot shape compatibility entries
    if (footShapeCompat) {
      for (const footShape of footShapeCompat) {
        await ctx.db.insert("footShapeCompat", { shoeId, footShape });
      }
    }

    return shoeId;
  },
});

export const search = query({
  args: {
    searchTerm: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    if (!args.searchTerm.trim()) {
      return await ctx.db
        .query("shoes")
        .withIndex("by_brand_name")
        .order("asc")
        .paginate(args.paginationOpts);
    }

    return await ctx.db
      .query("shoes")
      .withSearchIndex("search_shoes", (q) =>
        q.search("name", args.searchTerm.trim()),
      )
      .paginate(args.paginationOpts);
  },
});

const shoeEnrichmentEntryValidator = v.object({
  brand: v.string(),
  name: v.string(),
  officialUrl: v.string(),
  description: v.string(),
  officialSpecs: shoeOfficialSpecsValidator,
  confidence: v.number(),
  reviewStatus: v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected"),
  ),
});

async function applyEnrichmentEntries(
  ctx: any,
  entries: Array<{
    brand: string;
    name: string;
    officialUrl: string;
    description: string;
    officialSpecs: {
      closure?: string;
      upper?: string;
      lining?: string;
      midsole?: string;
      sole?: string;
      weight?: string;
      sensitivity?: string;
      rigidity?: string;
    };
    confidence: number;
    reviewStatus: "pending" | "approved" | "rejected";
  }>,
) {
  const updated: string[] = [];
  const missing: string[] = [];
  const extractedAt = Date.now();

  for (const entry of entries) {
    let shoe = await ctx.db
      .query("shoes")
      .withIndex("by_brand_name", (q: any) =>
        q.eq("brand", entry.brand).eq("name", entry.name),
      )
      .first();

    if (!shoe) {
      const normalizedName = entry.name.toLowerCase().replace(/^n\/a:\s*/, "").trim();
      const brandShoes = await ctx.db
        .query("shoes")
        .withIndex("by_brand", (q: any) => q.eq("brand", entry.brand))
        .collect();
      shoe = brandShoes.find(
        (candidate: any) =>
          candidate.name.toLowerCase().replace(/^n\/a:\s*/, "").trim() === normalizedName,
      ) ?? null;
    }

    if (!shoe) {
      missing.push(`${entry.brand}: ${entry.name}`);
      continue;
    }

    await ctx.db.patch(shoe._id, {
      description: entry.description,
      officialUrl: entry.officialUrl,
      officialSpecs: entry.officialSpecs,
      defaultScores: calculateEnrichmentScores(shoe, entry.officialSpecs),
      enrichment: {
        sourceUrl: entry.officialUrl,
        sourceName: `${entry.brand} official product page`,
        extractedAt,
        confidence: entry.confidence,
        reviewStatus: entry.reviewStatus,
      },
    });
    updated.push(`${entry.brand}: ${entry.name}`);
  }

  return { updated, missing };
}

export const applyEnrichment = mutation({
  args: { entries: v.array(shoeEnrichmentEntryValidator) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await applyEnrichmentEntries(ctx, args.entries);
  },
});

export const serviceApplyEnrichment = internalMutation({
  args: { entries: v.array(shoeEnrichmentEntryValidator) },
  handler: async (ctx, args) => await applyEnrichmentEntries(ctx, args.entries),
});

export const reviewEnrichment = mutation({
  args: {
    id: v.id("shoes"),
    reviewStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const shoe = await ctx.db.get(args.id);
    if (!shoe?.enrichment) throw new Error("Shoe enrichment not found");
    await ctx.db.patch(args.id, {
      enrichment: { ...shoe.enrichment, reviewStatus: args.reviewStatus },
    });
    return args.id;
  },
});

export const update = mutation({
  args: {
    id: v.id("shoes"),
    ...optionalShoeFieldsValidator,
    modelName: v.optional(v.string()),
    variantLabel: v.optional(v.string()),
    parentModelId: v.optional(v.id("shoes")),
    stiffness: v.optional(v.string()),
    climbingDiscipline: v.optional(v.string()),
    volume: v.optional(v.string()),
    rubberTechnologyId: v.optional(v.id("rubberTechnologies")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, modelName, variantLabel, parentModelId, ...updates } = args;

    const shoe = await ctx.db.get(id);
    if (!shoe) {
      throw new Error("Shoe not found");
    }

    const nextName = updates.name ?? shoe.name;
    const nextBrand = updates.brand ?? shoe.brand;
    const nextGender = updates.gender ?? shoe.gender;
    const nextModelName =
      modelName !== undefined
        ? modelName.trim() || deriveModelName(nextName)
        : shoe.modelName || deriveModelName(nextName);
    const nextVariantLabel =
      variantLabel !== undefined
        ? variantLabel.trim() || undefined
        : shoe.variantLabel || deriveVariantLabel(nextName, nextGender);
    const nextParentModelId =
      parentModelId !== undefined
        ? parentModelId
        : await resolveParentModelId(
          ctx,
          nextBrand,
          nextModelName,
          nextVariantLabel,
          id,
        );
    const nextRubberTechnologyId = updates.rubberTechnologyId ?? shoe.rubberTechnologyId;

    if (!nextRubberTechnologyId) {
      throw new Error("Rubber technology is required for every shoe");
    }

    await ensureRubberTechnologyExists(ctx, nextRubberTechnologyId);

    return await ctx.db.patch(id, {
      ...Object.fromEntries(
        Object.entries(updates).filter(([, value]) => value !== undefined),
      ),
      modelName: nextModelName,
      variantLabel: nextVariantLabel,
      parentModelId: nextParentModelId,
    });
  },
});

export const backfillVariantMetadata = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
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
  },
});

export const getMissingRubberTechnologyReport = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
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
  },
});

export const backfillMissingRubberTechnology = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
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
  },
});

export const remove = mutation({
  args: { id: v.id("shoes") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const shoe = await ctx.db.get(args.id);
    if (!shoe) {
      throw new Error("Shoe not found");
    }

    const footShapeCompat = await ctx.db
      .query("footShapeCompat")
      .withIndex("by_shoe", (q) => q.eq("shoeId", args.id))
      .collect();

    for (const compat of footShapeCompat) {
      await ctx.db.delete(compat._id);
    }

    await deleteUserShoesForShoe(ctx, args.id);

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const bulkUpsertByBrand = mutation({
  args: {
    brand: v.string(),
    shoes: v.array(
      v.object({
        name: v.string(),
        imageUrl: v.optional(v.string()),
        aggressiveness: v.optional(v.string()),
        stiffness: v.optional(v.string()),
        climbingDiscipline: v.optional(v.string()),
        volume: v.optional(v.string()),
        gender: v.optional(v.union(
          v.literal("men"),
          v.literal("women"),
          v.literal("kids"),
          v.literal("unisex"),
        )),
        footShapeCompat: v.optional(v.array(footShapeValidator)),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const updated: string[] = [];
    const created: string[] = [];

    for (const shoeData of args.shoes) {
      const existing = await ctx.db
        .query("shoes")
        .withIndex("by_brand", (q) => q.eq("brand", args.brand))
        .filter((q) => q.eq(q.field("name"), shoeData.name))
        .first();

      if (existing) {
        const patch: Record<string, unknown> = {};
        if (shoeData.imageUrl !== undefined) patch['imageUrl'] = shoeData.imageUrl;
        if (shoeData.aggressiveness !== undefined) patch['aggressiveness'] = shoeData.aggressiveness;
        if (shoeData.stiffness !== undefined) patch['stiffness'] = shoeData.stiffness;
        if (shoeData.climbingDiscipline !== undefined) patch['climbingDiscipline'] = shoeData.climbingDiscipline;
        if (shoeData.volume !== undefined) patch['volume'] = shoeData.volume;
        if (shoeData.gender !== undefined) patch['gender'] = shoeData.gender;

        if (Object.keys(patch).length > 0) {
          await ctx.db.patch(existing._id, patch);
        }
        updated.push(shoeData.name);
        continue;
      }

      const modelName = deriveModelName(shoeData.name);
      const variantLabel = deriveVariantLabel(shoeData.name, shoeData.gender);
      const parentModel = await findParentModel(ctx, args.brand, modelName);

      const shoeId = await ctx.db.insert("shoes", {
        name: shoeData.name,
        brand: args.brand,
        modelName,
        ...(variantLabel !== undefined ? { variantLabel } : {}),
        ...(parentModel?._id !== undefined ? { parentModelId: parentModel._id } : {}),
        aggressiveness: shoeData.aggressiveness ?? "moderate",
        stiffness: shoeData.stiffness ?? "medium",
        climbingDiscipline: shoeData.climbingDiscipline ?? "sport",
        volume: shoeData.volume ?? "medium",
        ...(shoeData.imageUrl !== undefined ? { imageUrl: shoeData.imageUrl } : {}),
        ...(shoeData.gender !== undefined ? { gender: shoeData.gender } : {}),
      });

      if (shoeData.footShapeCompat) {
        for (const footShape of shoeData.footShapeCompat) {
          await ctx.db.insert("footShapeCompat", { shoeId, footShape });
        }
      }
      created.push(shoeData.name);
    }

    return {
      success: true,
      updatedCount: updated.length,
      createdCount: created.length,
      updated,
      created,
    };
  },
});

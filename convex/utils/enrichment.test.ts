import { describe, expect, it, vi } from "vitest";
import { applyEnrichmentEntries } from "./enrichment";
import { calculateEnrichmentScores } from "./enrichmentScoring";
import { reviewEnrichment } from "../shoes";

const adminUser = {
  _id: "user-1",
  _creationTime: 1,
  email: "admin@example.com",
  emailVerified: true,
  onboardingComplete: true,
  isAdmin: true,
};

const baseShoe = {
  _id: "shoe-1",
  _creationTime: 1,
  name: "Drago",
  brand: "Scarpa",
  aggressiveness: "aggressive",
  stiffness: "soft",
  climbingDiscipline: "bouldering",
  volume: "medium",
};

const baseMetrics = {
  aggressiveness: "moderate",
  stiffness: "stiff",
  climbingDiscipline: "sport",
  volume: "low",
  brandAggressiveness: 7,
  brandStiffness: 6,
};

const baseEntry = {
  brand: "Scarpa",
  name: "Drago",
  officialUrl: "https://us.scarpa.com/products/drago",
  description: "A soft downturned shoe.",
  officialSpecs: { sole: "Vibram XS Grip2, 3.5 mm" },
  confidence: 0.9,
};

function createContext({
  shoe = baseShoe as any,
  rubber = null as any,
}: {
  shoe?: any;
  rubber?: { _id: string; brand: string; compound: string } | null;
} = {}) {
  const shoeFirst = vi.fn().mockResolvedValue(shoe);
  const rubberFirst = vi.fn().mockResolvedValue(rubber);
  const collect = vi.fn().mockResolvedValue(shoe ? [shoe] : []);
  const query = vi.fn((table: string) => ({
    withIndex: vi.fn().mockReturnValue({
      first: table === "rubberTechnologies" ? rubberFirst : shoeFirst,
      collect,
    }),
  }));
  const get = vi.fn(async (id: string) => {
    if (id === "user-1") return adminUser;
    if (id === "shoe-1") return shoe;
    return null;
  });
  const patch = vi.fn().mockResolvedValue(undefined);
  const insert = vi.fn().mockResolvedValue("rubber-new");
  const normalizeId = vi.fn((_table: string, id: string) =>
    id === "user-1" ? "user-1" : null,
  );
  const getUserIdentity = vi.fn().mockResolvedValue({ subject: "user-1" });

  return {
    db: { query, get, patch, insert, normalizeId },
    auth: { getUserIdentity },
  } as any;
}

describe("applyEnrichmentEntries", () => {
  it("stores pending metrics inside the enrichment record without patching row fields", async () => {
    const ctx = createContext();
    const metrics = {
      ...baseMetrics,
      rubber: { brand: "Vibram", compound: "XS Grip2" },
    };

    const result = await applyEnrichmentEntries(ctx, [
      { ...baseEntry, reviewStatus: "pending", metrics } as any,
    ]);

    expect(result.updated).toEqual(["Scarpa: Drago"]);
    const patchArg = ctx.db.patch.mock.calls[0][1];
    expect(patchArg.enrichment).toEqual(
      expect.objectContaining({ reviewStatus: "pending", metrics }),
    );
    for (const field of [
      "aggressiveness",
      "climbingDiscipline",
      "stiffness",
      "volume",
      "brandAggressiveness",
      "brandStiffness",
      "rubberTechnologyId",
    ]) {
      expect(patchArg).not.toHaveProperty(field);
    }
    expect(patchArg.defaultScores).toEqual(
      calculateEnrichmentScores(baseShoe, baseEntry.officialSpecs),
    );
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("applies approved metrics to the row and links an existing rubber", async () => {
    const ctx = createContext({
      rubber: { _id: "rubber-1", brand: "Vibram", compound: "XS Grip2" },
    });
    const metrics = {
      ...baseMetrics,
      rubber: { brand: "Vibram", compound: "XS Grip2" },
    };

    await applyEnrichmentEntries(ctx, [
      { ...baseEntry, reviewStatus: "approved", metrics } as any,
    ]);

    const patchArg = ctx.db.patch.mock.calls[0][1];
    expect(patchArg).toEqual(
      expect.objectContaining({
        aggressiveness: "moderate",
        stiffness: "stiff",
        climbingDiscipline: "sport",
        volume: "low",
        brandAggressiveness: 7,
        brandStiffness: 6,
        rubberTechnologyId: "rubber-1",
      }),
    );
    expect(patchArg.enrichment).toEqual(
      expect.objectContaining({ reviewStatus: "approved", metrics }),
    );
    expect(patchArg.defaultScores).toEqual(
      calculateEnrichmentScores(
        { ...baseShoe, ...baseMetrics },
        baseEntry.officialSpecs,
      ),
    );
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("creates the rubber technology when the compound is unknown but stickiness and durability are given", async () => {
    const ctx = createContext();
    const metrics = {
      rubber: {
        brand: "Vibram",
        compound: "XS Edge",
        stickiness: "medium",
        durability: "high",
      },
    };

    await applyEnrichmentEntries(ctx, [
      { ...baseEntry, reviewStatus: "approved", metrics } as any,
    ]);

    expect(ctx.db.insert).toHaveBeenCalledWith("rubberTechnologies", {
      brand: "Vibram",
      compound: "XS Edge",
      stickiness: "medium",
      durability: "high",
    });
    expect(ctx.db.patch.mock.calls[0][1].rubberTechnologyId).toBe("rubber-new");
  });

  it("leaves the shoe unlinked when the compound is unknown and stickiness or durability is missing", async () => {
    const ctx = createContext();
    const metrics = {
      rubber: { brand: "Vibram", compound: "XS Edge" },
    };

    await applyEnrichmentEntries(ctx, [
      { ...baseEntry, reviewStatus: "approved", metrics } as any,
    ]);

    expect(ctx.db.insert).not.toHaveBeenCalled();
    const patchArg = ctx.db.patch.mock.calls[0][1];
    expect(patchArg).not.toHaveProperty("rubberTechnologyId");
    expect(patchArg.enrichment.metrics).toEqual(metrics);
  });

  it("omits metrics from the enrichment record when the entry has none", async () => {
    const ctx = createContext();

    await applyEnrichmentEntries(ctx, [
      { ...baseEntry, reviewStatus: "pending" } as any,
    ]);

    const patchArg = ctx.db.patch.mock.calls[0][1];
    expect(patchArg.enrichment).not.toHaveProperty("metrics");
  });

  it("reports shoes that cannot be matched as missing", async () => {
    const ctx = createContext({ shoe: null });

    const result = await applyEnrichmentEntries(ctx, [
      { ...baseEntry, reviewStatus: "pending" } as any,
    ]);

    expect(result).toEqual({ updated: [], missing: ["Scarpa: Drago"] });
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
});

describe("reviewEnrichment", () => {
  const enrichedShoe = {
    ...baseShoe,
    enrichment: {
      sourceUrl: baseEntry.officialUrl,
      sourceName: "Scarpa official product page",
      extractedAt: 1,
      confidence: 0.9,
      reviewStatus: "pending",
      metrics: {
        ...baseMetrics,
        rubber: { brand: "Vibram", compound: "XS Grip2" },
      },
    },
  };

  it("applies staged metrics and recomputes scores on approval", async () => {
    const ctx = createContext({
      shoe: enrichedShoe,
      rubber: { _id: "rubber-1", brand: "Vibram", compound: "XS Grip2" },
    });

    const result = await (reviewEnrichment as any)._handler(ctx, {
      id: "shoe-1",
      reviewStatus: "approved",
    });

    expect(result).toBe("shoe-1");
    const patchArg = ctx.db.patch.mock.calls[0][1];
    expect(patchArg).toEqual(
      expect.objectContaining({
        aggressiveness: "moderate",
        stiffness: "stiff",
        climbingDiscipline: "sport",
        volume: "low",
        brandAggressiveness: 7,
        brandStiffness: 6,
        rubberTechnologyId: "rubber-1",
      }),
    );
    expect(patchArg.enrichment.reviewStatus).toBe("approved");
    expect(patchArg.defaultScores).toEqual(
      calculateEnrichmentScores({ ...baseShoe, ...baseMetrics }),
    );
  });

  it("only flips the status when rejecting", async () => {
    const ctx = createContext({ shoe: enrichedShoe });

    await (reviewEnrichment as any)._handler(ctx, {
      id: "shoe-1",
      reviewStatus: "rejected",
    });

    const patchArg = ctx.db.patch.mock.calls[0][1];
    expect(patchArg.enrichment.reviewStatus).toBe("rejected");
    expect(patchArg.enrichment.metrics).toEqual(enrichedShoe.enrichment.metrics);
    for (const field of [
      "aggressiveness",
      "climbingDiscipline",
      "stiffness",
      "volume",
      "brandAggressiveness",
      "brandStiffness",
      "rubberTechnologyId",
      "defaultScores",
    ]) {
      expect(patchArg).not.toHaveProperty(field);
    }
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("only flips the status when approving without staged metrics", async () => {
    const ctx = createContext({
      shoe: {
        ...baseShoe,
        enrichment: {
          sourceUrl: baseEntry.officialUrl,
          sourceName: "Scarpa official product page",
          extractedAt: 1,
          confidence: 0.9,
          reviewStatus: "pending",
        },
      },
    });

    await (reviewEnrichment as any)._handler(ctx, {
      id: "shoe-1",
      reviewStatus: "approved",
    });

    const patchArg = ctx.db.patch.mock.calls[0][1];
    expect(patchArg.enrichment.reviewStatus).toBe("approved");
    expect(patchArg).not.toHaveProperty("defaultScores");
    expect(patchArg).not.toHaveProperty("aggressiveness");
  });
});

import { mutation } from "./_generated/server";

const climbingShoes = [
  // La Sportiva
  { name: "Solution", brand: "La Sportiva", aggressiveness: "aggressive", stiffness: "stiff", climbingDiscipline: "bouldering", volume: "medium", rubber: { brand: "Vibram", compound: "XS Grip 2", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman"] },
  { name: "Solution Comp", brand: "La Sportiva", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "competition", volume: "low", rubber: { brand: "Vibram", compound: "XS Grip 2", stickiness: "high", durability: "low" }, footShapeCompat: ["egyptian", "greek"] },
  { name: "Skwama", brand: "La Sportiva", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "medium", rubber: { brand: "Vibram", compound: "XS Grip 2", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman", "greek"] },
  { name: "Miura", brand: "La Sportiva", aggressiveness: "moderate", stiffness: "stiff", climbingDiscipline: "sport", volume: "medium", rubber: { brand: "Vibram", compound: "XS Edge", stickiness: "medium", durability: "high" }, footShapeCompat: ["egyptian", "roman"] },
  { name: "Miura VS", brand: "La Sportiva", aggressiveness: "aggressive", stiffness: "stiff", climbingDiscipline: "sport", volume: "medium", rubber: { brand: "Vibram", compound: "XS Edge", stickiness: "medium", durability: "high" }, footShapeCompat: ["egyptian", "roman"] },
  { name: "Katana", brand: "La Sportiva", aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", rubber: { brand: "Vibram", compound: "XS Edge", stickiness: "medium", durability: "high" }, footShapeCompat: ["egyptian", "roman", "greek"] },
  { name: "Katana Lace", brand: "La Sportiva", aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "trad", volume: "medium", rubber: { brand: "Vibram", compound: "XS Edge", stickiness: "medium", durability: "high" }, footShapeCompat: ["egyptian", "roman", "greek", "germanic"] },
  { name: "Otaki", brand: "La Sportiva", aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", rubber: { brand: "Vibram", compound: "XS Grip 2", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman", "greek"] },
  { name: "Futura", brand: "La Sportiva", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "low", rubber: { brand: "Vibram", compound: "XS Grip 2", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "greek"] },
  { name: "Genius", brand: "La Sportiva", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "sport", volume: "low", rubber: { brand: "Vibram", compound: "XS Grip 2", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "greek"] },
  { name: "Tarantula", brand: "La Sportiva", aggressiveness: "flat", stiffness: "stiff", climbingDiscipline: "gym", volume: "high", rubber: { brand: "Vibram", compound: "FriXion RS", stickiness: "medium", durability: "high" }, footShapeCompat: ["egyptian", "roman", "greek", "germanic", "celtic"] },
  { name: "TC Pro", brand: "La Sportiva", aggressiveness: "flat", stiffness: "stiff", climbingDiscipline: "trad", volume: "high", rubber: { brand: "Vibram", compound: "XS Edge", stickiness: "medium", durability: "high" }, footShapeCompat: ["egyptian", "roman", "germanic"] },
  { name: "Cobra", brand: "La Sportiva", aggressiveness: "flat", stiffness: "soft", climbingDiscipline: "gym", volume: "medium", rubber: { brand: "Vibram", compound: "XS Grip 2", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman", "greek"] },
  { name: "Theory", brand: "La Sportiva", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "low", rubber: { brand: "Vibram", compound: "XS Grip 2", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "greek"] },

  // Scarpa
  { name: "Drago", brand: "Scarpa", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "medium", rubber: { brand: "Vibram", compound: "XS Grip 2", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman", "greek"] },
  { name: "Drago LV", brand: "Scarpa", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "low", rubber: { brand: "Vibram", compound: "XS Grip 2", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "greek"] },
  { name: "Instinct VS", brand: "Scarpa", aggressiveness: "aggressive", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", rubber: { brand: "Vibram", compound: "XS Edge", stickiness: "medium", durability: "high" }, footShapeCompat: ["egyptian", "roman"] },
  { name: "Instinct VSR", brand: "Scarpa", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "medium", rubber: { brand: "Vibram", compound: "XS Grip 2", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman"] },
  { name: "Furia Air", brand: "Scarpa", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "competition", volume: "low", rubber: { brand: "Vibram", compound: "XS Grip 2", stickiness: "high", durability: "low" }, footShapeCompat: ["egyptian", "greek"] },
  { name: "Furia S", brand: "Scarpa", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "low", rubber: { brand: "Vibram", compound: "XS Grip 2", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "greek"] },
  { name: "Vapor V", brand: "Scarpa", aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", rubber: { brand: "Vibram", compound: "XS Edge", stickiness: "medium", durability: "high" }, footShapeCompat: ["egyptian", "roman", "greek"] },
  { name: "Vapor Lace", brand: "Scarpa", aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "trad", volume: "medium", rubber: { brand: "Vibram", compound: "XS Edge", stickiness: "medium", durability: "high" }, footShapeCompat: ["egyptian", "roman", "greek", "germanic"] },
  { name: "Veloce", brand: "Scarpa", aggressiveness: "flat", stiffness: "medium", climbingDiscipline: "gym", volume: "high", rubber: { brand: "Vibram", compound: "XS Edge", stickiness: "medium", durability: "high" }, footShapeCompat: ["egyptian", "roman", "greek", "germanic", "celtic"] },
  { name: "Maestro", brand: "Scarpa", aggressiveness: "aggressive", stiffness: "stiff", climbingDiscipline: "sport", volume: "medium", rubber: { brand: "Vibram", compound: "XS Edge", stickiness: "medium", durability: "high" }, footShapeCompat: ["egyptian", "roman"] },
  { name: "Chimera", brand: "Scarpa", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "low", rubber: { brand: "Vibram", compound: "XS Grip 2", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "greek"] },

  // Five Ten
  { name: "Hiangle", brand: "Five Ten", aggressiveness: "aggressive", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", rubber: { brand: "Stealth", compound: "C4", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman"] },
  { name: "Hiangle Pro", brand: "Five Ten", aggressiveness: "aggressive", stiffness: "medium", climbingDiscipline: "competition", volume: "low", rubber: { brand: "Stealth", compound: "C4", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "greek"] },
  { name: "Aleon", brand: "Five Ten", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "medium", rubber: { brand: "Stealth", compound: "C4", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman", "greek"] },
  { name: "Anasazi Pro", brand: "Five Ten", aggressiveness: "moderate", stiffness: "stiff", climbingDiscipline: "trad", volume: "medium", rubber: { brand: "Stealth", compound: "C4", stickiness: "high", durability: "high" }, footShapeCompat: ["egyptian", "roman", "germanic"] },
  { name: "Anasazi Lace", brand: "Five Ten", aggressiveness: "moderate", stiffness: "stiff", climbingDiscipline: "trad", volume: "medium", rubber: { brand: "Stealth", compound: "C4", stickiness: "high", durability: "high" }, footShapeCompat: ["egyptian", "roman", "greek", "germanic"] },
  { name: "Anasazi VCS", brand: "Five Ten", aggressiveness: "moderate", stiffness: "stiff", climbingDiscipline: "sport", volume: "medium", rubber: { brand: "Stealth", compound: "C4", stickiness: "high", durability: "high" }, footShapeCompat: ["egyptian", "roman"] },
  { name: "Kirigami", brand: "Five Ten", aggressiveness: "flat", stiffness: "soft", climbingDiscipline: "gym", volume: "medium", rubber: { brand: "Stealth", compound: "C4", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman", "greek", "germanic", "celtic"] },
  { name: "Niad VCS", brand: "Five Ten", aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", rubber: { brand: "Stealth", compound: "C4", stickiness: "high", durability: "high" }, footShapeCompat: ["egyptian", "roman", "greek"] },
  { name: "Crawe", brand: "Five Ten", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "low", rubber: { brand: "Stealth", compound: "C4", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "greek"] },

  // Evolv
  { name: "Shaman", brand: "Evolv", aggressiveness: "aggressive", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", rubber: { brand: "Trax", compound: "SAS", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman", "greek"] },
  { name: "Phantom", brand: "Evolv", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "low", rubber: { brand: "Trax", compound: "SAS", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "greek"] },
  { name: "Zenist", brand: "Evolv", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "competition", volume: "low", rubber: { brand: "Trax", compound: "SAS", stickiness: "high", durability: "low" }, footShapeCompat: ["egyptian", "greek"] },
  { name: "Kira", brand: "Evolv", aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport", volume: "low", rubber: { brand: "Trax", compound: "SAS", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "greek"] },
  { name: "Elektra", brand: "Evolv", aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "gym", volume: "low", rubber: { brand: "Trax", compound: "SAS", stickiness: "medium", durability: "medium" }, footShapeCompat: ["egyptian", "roman", "greek"] },
  { name: "Defy", brand: "Evolv", aggressiveness: "flat", stiffness: "medium", climbingDiscipline: "gym", volume: "high", rubber: { brand: "Trax", compound: "SAS", stickiness: "medium", durability: "high" }, footShapeCompat: ["egyptian", "roman", "greek", "germanic", "celtic"] },
  { name: "Kronos", brand: "Evolv", aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", rubber: { brand: "Trax", compound: "SAS", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman", "greek"] },

  // Butora
  { name: "Acro", brand: "Butora", aggressiveness: "aggressive", stiffness: "medium", climbingDiscipline: "bouldering", volume: "medium", rubber: { brand: "NEO Fuse", compound: "Standard", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman", "greek", "celtic"] },
  { name: "Acro Comp", brand: "Butora", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "competition", volume: "low", rubber: { brand: "NEO Fuse", compound: "Standard", stickiness: "high", durability: "low" }, footShapeCompat: ["egyptian", "greek"] },
  { name: "Altura", brand: "Butora", aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", rubber: { brand: "NEO Fuse", compound: "Standard", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman", "greek"] },
  { name: "Endeavor", brand: "Butora", aggressiveness: "flat", stiffness: "medium", climbingDiscipline: "gym", volume: "high", rubber: { brand: "NEO Fuse", compound: "Standard", stickiness: "medium", durability: "high" }, footShapeCompat: ["egyptian", "roman", "greek", "germanic", "celtic"] },
  { name: "Gomi", brand: "Butora", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "low", rubber: { brand: "NEO Fuse", compound: "Standard", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "greek"] },

  // Tenaya
  { name: "Oasi", brand: "Tenaya", aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", rubber: { brand: "Vibram", compound: "XS Grip", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman", "greek"] },
  { name: "Iati", brand: "Tenaya", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "low", rubber: { brand: "Vibram", compound: "XS Grip 2", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "greek"] },
  { name: "Mastia", brand: "Tenaya", aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", rubber: { brand: "Vibram", compound: "XS Grip", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman", "greek"] },
  { name: "Tarifa", brand: "Tenaya", aggressiveness: "aggressive", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", rubber: { brand: "Vibram", compound: "XS Grip 2", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman"] },
  { name: "Mundaka", brand: "Tenaya", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "competition", volume: "low", rubber: { brand: "Vibram", compound: "XS Grip 2", stickiness: "high", durability: "low" }, footShapeCompat: ["egyptian", "greek"] },

  // Black Diamond
  { name: "Shadow", brand: "Black Diamond", aggressiveness: "aggressive", stiffness: "stiff", climbingDiscipline: "bouldering", volume: "medium", rubber: { brand: "NeoFriction", compound: "Standard", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman"] },
  { name: "Shadow LV", brand: "Black Diamond", aggressiveness: "aggressive", stiffness: "stiff", climbingDiscipline: "bouldering", volume: "low", rubber: { brand: "NeoFriction", compound: "Standard", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "greek"] },
  { name: "Zone", brand: "Black Diamond", aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", rubber: { brand: "NeoFriction", compound: "Standard", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman", "greek"] },
  { name: "Zone LV", brand: "Black Diamond", aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport", volume: "low", rubber: { brand: "NeoFriction", compound: "Standard", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "greek"] },
  { name: "Momentum", brand: "Black Diamond", aggressiveness: "flat", stiffness: "medium", climbingDiscipline: "gym", volume: "high", rubber: { brand: "NeoFriction", compound: "Standard", stickiness: "medium", durability: "high" }, footShapeCompat: ["egyptian", "roman", "greek", "germanic", "celtic"] },
  { name: "Focus", brand: "Black Diamond", aggressiveness: "moderate", stiffness: "stiff", climbingDiscipline: "trad", volume: "medium", rubber: { brand: "NeoFriction", compound: "Standard", stickiness: "medium", durability: "high" }, footShapeCompat: ["egyptian", "roman", "germanic"] },

  // Mad Rock
  { name: "Remora", brand: "Mad Rock", aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "gym", volume: "medium", rubber: { brand: "Science Friction", compound: "3.0", stickiness: "medium", durability: "medium" }, footShapeCompat: ["egyptian", "roman", "greek", "germanic"] },
  { name: "Drone", brand: "Mad Rock", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "medium", rubber: { brand: "Science Friction", compound: "3.0", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman", "greek"] },
  { name: "Shark 2.0", brand: "Mad Rock", aggressiveness: "aggressive", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", rubber: { brand: "Science Friction", compound: "3.0", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman"] },
  { name: "Weaver", brand: "Mad Rock", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "competition", volume: "low", rubber: { brand: "Science Friction", compound: "3.0", stickiness: "high", durability: "low" }, footShapeCompat: ["egyptian", "greek"] },
  { name: "Drifter", brand: "Mad Rock", aggressiveness: "flat", stiffness: "medium", climbingDiscipline: "gym", volume: "high", rubber: { brand: "Science Friction", compound: "3.0", stickiness: "medium", durability: "high" }, footShapeCompat: ["egyptian", "roman", "greek", "germanic", "celtic"] },

  // Unparallel
  { name: "TN Pro", brand: "Unparallel", aggressiveness: "aggressive", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", rubber: { brand: "RH", compound: "Standard", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman"] },
  { name: "Flagship", brand: "Unparallel", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "low", rubber: { brand: "RH", compound: "Standard", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "greek"] },
  { name: "Sirius", brand: "Unparallel", aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", rubber: { brand: "RH", compound: "Standard", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman", "greek"] },
  { name: "Up Lace", brand: "Unparallel", aggressiveness: "flat", stiffness: "medium", climbingDiscipline: "gym", volume: "high", rubber: { brand: "RH", compound: "Standard", stickiness: "medium", durability: "high" }, footShapeCompat: ["egyptian", "roman", "greek", "germanic", "celtic"] },
  { name: "Regulus", brand: "Unparallel", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "competition", volume: "low", rubber: { brand: "RH", compound: "Standard", stickiness: "high", durability: "low" }, footShapeCompat: ["egyptian", "greek"] },

  // So iLL
  { name: "The Bowler", brand: "So iLL", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "medium", rubber: { brand: "Dark Matter", compound: "Standard", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman", "greek"] },
  { name: "New Zero", brand: "So iLL", aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport", volume: "medium", rubber: { brand: "Dark Matter", compound: "Standard", stickiness: "high", durability: "medium" }, footShapeCompat: ["egyptian", "roman", "greek"] },
  { name: "Free Range", brand: "So iLL", aggressiveness: "flat", stiffness: "soft", climbingDiscipline: "gym", volume: "high", rubber: { brand: "Dark Matter", compound: "Standard", stickiness: "medium", durability: "high" }, footShapeCompat: ["egyptian", "roman", "greek", "germanic", "celtic"] },
] as const;

type FootShape = "egyptian" | "roman" | "greek" | "germanic" | "celtic";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingShoes = await ctx.db.query("shoes").first();
    if (existingShoes) {
      return { success: false, message: "Database already seeded" };
    }

    let shoesCreated = 0;
    let rubberTechsCreated = 0;

    for (const shoeData of climbingShoes) {
      // Find or create rubber technology
      let rubberTechId = await ctx.db
        .query("rubberTechnologies")
        .withIndex("by_brand_compound", (q) =>
          q.eq("brand", shoeData.rubber.brand).eq("compound", shoeData.rubber.compound)
        )
        .first()
        .then((r) => r?._id);

      if (!rubberTechId) {
        rubberTechId = await ctx.db.insert("rubberTechnologies", {
          brand: shoeData.rubber.brand,
          compound: shoeData.rubber.compound,
          stickiness: shoeData.rubber.stickiness,
          durability: shoeData.rubber.durability,
        });
        rubberTechsCreated++;
      }

      // Create shoe
      const shoeId = await ctx.db.insert("shoes", {
        name: shoeData.name,
        brand: shoeData.brand,
        aggressiveness: shoeData.aggressiveness,
        stiffness: shoeData.stiffness,
        climbingDiscipline: shoeData.climbingDiscipline,
        volume: shoeData.volume,
        rubberTechnologyId: rubberTechId,
      });
      shoesCreated++;

      // Add foot shape compatibility
      for (const footShape of shoeData.footShapeCompat) {
        await ctx.db.insert("footShapeCompat", {
          shoeId,
          footShape: footShape as FootShape,
        });
      }
    }

    return {
      success: true,
      message: `Seeded ${shoesCreated} shoes and ${rubberTechsCreated} rubber technologies`,
    };
  },
});

export const clearDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all data (use with caution!)
    const tables = ["footShapeCompat", "comfortRankings", "userShoes", "shoes", "rubberTechnologies"] as const;
    
    for (const table of tables) {
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }

    return { success: true, message: "Database cleared" };
  },
});

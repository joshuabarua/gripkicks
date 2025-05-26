import { PrismaClient, FootShape } from '@prisma/client';

const prisma = new PrismaClient();

// Top 8 brands starter set
const starterShoes = [
  {
    name: "Solution",
    brand: "La Sportiva",
    imageUrl: "unknown",
    aggressiveness: "aggressive",
    stiffness: "stiff",
    climbingDiscipline: "bouldering",
    volume: "medium",
    rubber: {
      brand: "Vibram",
      compound: "XS Grip",
      stickiness: "high",
      durability: "medium"
    },
    comfortRankings: [
      { footShape: "egyptian", volume: "low", score: 4 },
      { footShape: "roman", volume: "medium", score: 3 },
    ],
    footShapeCompat: ["egyptian", "roman"]
  },
  {
    name: "Drago",
    brand: "Scarpa",
    imageUrl: "unknown",
    aggressiveness: "aggressive",
    stiffness: "soft",
    climbingDiscipline: "bouldering",
    volume: "medium",
    rubber: {
      brand: "Vibram",
      compound: "XS Grip 2",
      stickiness: "high",
      durability: "medium"
    },
    comfortRankings: [
      { footShape: "egyptian", volume: "medium", score: 3 },
      { footShape: "roman", volume: "medium", score: 3 },
    ],
    footShapeCompat: ["egyptian", "roman", "greek"]
  },
  {
    name: "Hiangle",
    brand: "Five Ten",
    imageUrl: "unknown",
    aggressiveness: "aggressive",
    stiffness: "medium",
    climbingDiscipline: "sport",
    volume: "medium",
    rubber: {
      brand: "Stealth",
      compound: "C4",
      stickiness: "high",
      durability: "medium"
    },
    comfortRankings: [
      { footShape: "egyptian", volume: "medium", score: 3 }
    ],
    footShapeCompat: ["egyptian", "roman"]
  },
  {
    name: "Shaman",
    brand: "Evolv",
    imageUrl: "unknown",
    aggressiveness: "aggressive",
    stiffness: "medium",
    climbingDiscipline: "sport",
    volume: "medium",
    rubber: {
      brand: "Trax",
      compound: "SAS",
      stickiness: "medium",
      durability: "medium"
    },
    comfortRankings: [],
    footShapeCompat: ["egyptian", "roman", "greek"]
  },
  {
    name: "Remora",
    brand: "Mad Rock",
    imageUrl: "unknown",
    aggressiveness: "moderate",
    stiffness: "medium",
    climbingDiscipline: "gym",
    volume: "medium",
    rubber: {
      brand: "Science Friction",
      compound: "3.0",
      stickiness: "medium",
      durability: "medium"
    },
    comfortRankings: [],
    footShapeCompat: ["egyptian", "roman", "greek", "germanic"]
  },
  {
    name: "Shadow",
    brand: "Black Diamond",
    imageUrl: "unknown",
    aggressiveness: "aggressive",
    stiffness: "stiff",
    climbingDiscipline: "bouldering",
    volume: "medium",
    rubber: {
      brand: "NeoFriction",
      compound: "unknown",
      stickiness: "medium",
      durability: "medium"
    },
    comfortRankings: [],
    footShapeCompat: ["egyptian", "roman"]
  },
  {
    name: "Oasi",
    brand: "Tenaya",
    imageUrl: "unknown",
    aggressiveness: "moderate",
    stiffness: "medium",
    climbingDiscipline: "sport",
    volume: "medium",
    rubber: {
      brand: "Vibram",
      compound: "XS Grip",
      stickiness: "medium",
      durability: "medium"
    },
    comfortRankings: [],
    footShapeCompat: ["egyptian", "roman", "greek"]
  },
  {
    name: "Acro",
    brand: "Butora",
    imageUrl: "unknown",
    aggressiveness: "aggressive",
    stiffness: "medium",
    climbingDiscipline: "bouldering",
    volume: "medium",
    rubber: {
      brand: "NEO Fuse",
      compound: "unknown",
      stickiness: "high",
      durability: "medium"
    },
    comfortRankings: [],
    footShapeCompat: ["egyptian", "roman", "greek", "celtic"]
  }
];

async function main() {
  for (const shoe of starterShoes) {
    // Upsert rubber technology
    const rubber = await prisma.rubberTechnology.upsert({
      where: {
        brand_compound: {
          brand: shoe.rubber.brand,
          compound: shoe.rubber.compound
        }
      },
      update: {},
      create: {
        brand: shoe.rubber.brand,
        compound: shoe.rubber.compound,
        stickiness: shoe.rubber.stickiness,
        durability: shoe.rubber.durability
      }
    });

    // Create shoe
    const newShoe = await prisma.shoe.create({
      data: {
        name: shoe.name,
        brand: shoe.brand,
        imageUrl: shoe.imageUrl,
        aggressiveness: shoe.aggressiveness,
        stiffness: shoe.stiffness,
        climbingDiscipline: shoe.climbingDiscipline,
        volume: shoe.volume,
        rubberTechnologyId: rubber.id,
      }
    });

    // Add comfort rankings
    for (const cr of shoe.comfortRankings) {
      await prisma.comfortRanking.create({
        data: {
          shoeId: newShoe.id,
          footShape: cr.footShape as FootShape,
          volume: cr.volume,
          score: cr.score || 3
        }
      });
    }

    // Add foot shape compatibilities
    for (const fs of shoe.footShapeCompat) {
      await prisma.footShapeCompat.create({
        data: {
          shoeId: newShoe.id,
          footShape: fs as FootShape
        }
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// To add more shoes, simply add more entries to the starterShoes array above following the same structure.

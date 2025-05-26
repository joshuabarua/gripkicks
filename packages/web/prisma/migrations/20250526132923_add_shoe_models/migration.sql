-- CreateEnum
CREATE TYPE "FootShape" AS ENUM ('egyptian', 'roman', 'greek', 'germanic', 'celtic');

-- CreateTable
CREATE TABLE "Shoe" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "imageUrl" TEXT,
    "aggressiveness" TEXT NOT NULL,
    "stiffness" TEXT NOT NULL,
    "climbingDiscipline" TEXT NOT NULL,
    "volume" TEXT NOT NULL,
    "rubberTechnologyId" TEXT,

    CONSTRAINT "Shoe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubberTechnology" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "compound" TEXT NOT NULL,
    "stickiness" TEXT NOT NULL,
    "durability" TEXT NOT NULL,

    CONSTRAINT "RubberTechnology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComfortRanking" (
    "id" TEXT NOT NULL,
    "shoeId" TEXT NOT NULL,
    "footShape" "FootShape" NOT NULL,
    "volume" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "ComfortRanking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FootShapeCompat" (
    "id" TEXT NOT NULL,
    "shoeId" TEXT NOT NULL,
    "footShape" "FootShape" NOT NULL,

    CONSTRAINT "FootShapeCompat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Shoe" ADD CONSTRAINT "Shoe_rubberTechnologyId_fkey" FOREIGN KEY ("rubberTechnologyId") REFERENCES "RubberTechnology"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComfortRanking" ADD CONSTRAINT "ComfortRanking_shoeId_fkey" FOREIGN KEY ("shoeId") REFERENCES "Shoe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FootShapeCompat" ADD CONSTRAINT "FootShapeCompat_shoeId_fkey" FOREIGN KEY ("shoeId") REFERENCES "Shoe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

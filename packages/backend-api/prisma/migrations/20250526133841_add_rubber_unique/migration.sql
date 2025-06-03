/*
  Warnings:

  - A unique constraint covering the columns `[brand,compound]` on the table `RubberTechnology` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RubberTechnology_brand_compound_key" ON "RubberTechnology"("brand", "compound");

/*
  Warnings:

  - Made the column `base_unit` on table `categories` required. This step will fail if there are existing NULL values in that column.

*/
-- Data Migration: Fill NULL base_unit values before making it NOT NULL
UPDATE "categories" c
SET "base_unit" = (
    SELECT p."base_unit"
    FROM "products" p
    WHERE p."category_id" = c.id
    LIMIT 1
)
WHERE c."base_unit" IS NULL;

-- Fallback for categories without products: use 'cai' if it exists, otherwise use any unit
UPDATE "categories"
SET "base_unit" = COALESCE(
    (SELECT "code" FROM "units" WHERE "code" = 'cai'),
    (SELECT "code" FROM "units" LIMIT 1)
)
WHERE "base_unit" IS NULL;

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_base_unit_fkey";

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "base_unit" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_base_unit_fkey" FOREIGN KEY ("base_unit") REFERENCES "units"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

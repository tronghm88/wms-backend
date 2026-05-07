/*
  Warnings:

  - Made the column `base_unit` on table `categories` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_base_unit_fkey";

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "base_unit" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_base_unit_fkey" FOREIGN KEY ("base_unit") REFERENCES "units"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

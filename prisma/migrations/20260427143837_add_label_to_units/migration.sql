/*
  Warnings:

  - Added the required column `label` to the `units` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "units" ADD COLUMN "label" TEXT;
UPDATE "units" SET "label" = "code";
ALTER TABLE "units" ALTER COLUMN "label" SET NOT NULL;

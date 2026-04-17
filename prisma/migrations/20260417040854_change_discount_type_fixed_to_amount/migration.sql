/*
  Warnings:

  - The values [FIXED] on the enum `DiscountType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DiscountType_new" AS ENUM ('NONE', 'PERCENT', 'AMOUNT');
ALTER TABLE "discount_policies" ALTER COLUMN "discount_type" TYPE "DiscountType_new" USING ("discount_type"::text::"DiscountType_new");
ALTER TABLE "issue_ticket_lines" ALTER COLUMN "discount_type" TYPE "DiscountType_new" USING ("discount_type"::text::"DiscountType_new");
ALTER TYPE "DiscountType" RENAME TO "DiscountType_old";
ALTER TYPE "DiscountType_new" RENAME TO "DiscountType";
DROP TYPE "public"."DiscountType_old";
COMMIT;

-- AlterTable
ALTER TABLE "issue_ticket_lines" ADD COLUMN     "is_override" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "original_price" DECIMAL(15,3);

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "parent_product_id" INTEGER;

-- AlterTable
ALTER TABLE "receipt_ticket_lines" ADD COLUMN     "area_m2" DECIMAL(15,3),
ADD COLUMN     "length_m" DECIMAL(15,3),
ADD COLUMN     "weight_kg" DECIMAL(15,3);

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_parent_product_id_fkey" FOREIGN KEY ("parent_product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

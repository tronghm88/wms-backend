-- AlterEnum
ALTER TYPE "DiscountType" ADD VALUE 'NONE';
ALTER TYPE "DiscountType" ADD VALUE 'AMOUNT';

-- AlterTable
ALTER TABLE "discount_policies" ADD COLUMN     "is_used" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- DropIndex
DROP INDEX "discount_policies_customer_id_is_applied_all_key";

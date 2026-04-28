-- AlterTable
ALTER TABLE "products" ADD COLUMN     "cost_price" DECIMAL(15,3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "reorder_threshold" DECIMAL(15,3) NOT NULL DEFAULT 0,
ADD COLUMN     "spec_text" VARCHAR(100);

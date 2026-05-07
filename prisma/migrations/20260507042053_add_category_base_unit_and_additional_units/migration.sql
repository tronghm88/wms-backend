-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "additional_units" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "base_unit" TEXT;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_base_unit_fkey" FOREIGN KEY ("base_unit") REFERENCES "units"("code") ON DELETE SET NULL ON UPDATE CASCADE;

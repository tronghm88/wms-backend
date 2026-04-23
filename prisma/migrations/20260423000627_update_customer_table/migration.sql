-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('ENTERPRISE', 'AGENCY', 'RETAIL', 'VIP');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "assigned_staff_id" INTEGER,
ADD COLUMN     "billing_address" TEXT,
ADD COLUMN     "company_name" VARCHAR(100),
ADD COLUMN     "contact_person" VARCHAR(100),
ADD COLUMN     "shipping_address" TEXT,
ADD COLUMN     "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "tax_code" VARCHAR(255),
ADD COLUMN     "type" "CustomerType";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "note" TEXT;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_assigned_staff_id_fkey" FOREIGN KEY ("assigned_staff_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

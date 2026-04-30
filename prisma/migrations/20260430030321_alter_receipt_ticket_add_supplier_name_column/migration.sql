-- AlterTable
ALTER TABLE "receipt_tickets" ADD COLUMN     "invoice_date" TIMESTAMP(3),
ADD COLUMN     "invoice_no" VARCHAR(50),
ADD COLUMN     "supplier_name" VARCHAR(100);

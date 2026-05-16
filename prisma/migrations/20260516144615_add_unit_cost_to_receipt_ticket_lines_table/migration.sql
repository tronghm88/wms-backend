-- AlterTable
ALTER TABLE "receipt_ticket_lines" ADD COLUMN     "unit_cost" DECIMAL(15,3);

-- AlterTable
ALTER TABLE "stock_movements" ADD COLUMN     "unit_cost" DECIMAL(15,3);

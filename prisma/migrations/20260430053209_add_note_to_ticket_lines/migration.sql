-- AlterTable
ALTER TABLE "issue_ticket_lines" ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "receipt_ticket_lines" ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "split_ticket_lines" ADD COLUMN     "note" TEXT;

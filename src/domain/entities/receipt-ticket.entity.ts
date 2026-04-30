import { Decimal } from "decimal.js";
import { TransactionStatus } from "../enums";

export class ReceiptTicketEntity {
  id: number;
  ticketNo: string;
  date: Date;
  status: TransactionStatus;
  createdBy: number;
  note: string | null;
  supplierName: string | null;
  invoiceNo: string | null;
  invoiceDate: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Metadata for list view
  createdByName?: string;
  totalLines?: number;
  totalQuantity?: Decimal | null;

  constructor(partial?: Partial<ReceiptTicketEntity>) {
    Object.assign(this, partial);
  }
}

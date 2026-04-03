import { Decimal } from "decimal.js";
import { TransactionStatus } from "../enums";

export class SplitTicketEntity {
  id: number;
  ticketNo: string;
  date: Date;
  status: TransactionStatus;
  createdBy: number;
  sourceProductId: number;
  sourceQty: Decimal;
  sourceUnitCode: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<SplitTicketEntity>) {
    Object.assign(this, partial);
    if (partial?.sourceQty) {
      this.sourceQty = new Decimal(partial.sourceQty);
    }
  }
}

import { Decimal } from "decimal.js";
import { TransactionStatus } from "../enums";
import { SplitTicketLineEntity } from "./split-ticket-line.entity";

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
  lines?: SplitTicketLineEntity[];

  constructor(partial?: Partial<SplitTicketEntity>) {
    Object.assign(this, partial);
    if (partial?.sourceQty) {
      this.sourceQty = new Decimal(partial.sourceQty);
    }
    if (partial?.lines) {
      this.lines = partial.lines.map((l) => new SplitTicketLineEntity(l));
    }
  }
}

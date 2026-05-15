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

  // Metadata for list view
  createdByName?: string;
  sourceProductCode?: string;
  sourceProductName?: string;
  sourceUnitLabel?: string;
  totalSplitQty?: Decimal;
  linesCount?: number;

  constructor(partial?: Partial<SplitTicketEntity>) {
    Object.assign(this, partial);
    if (partial?.sourceQty) {
      this.sourceQty = new Decimal(partial.sourceQty);
    }
    if (partial?.lines) {
      this.lines = partial.lines.map((l) => new SplitTicketLineEntity(l));
      this.totalSplitQty = this.lines.reduce(
        (sum, line) => sum.plus(line.quantity),
        new Decimal(0),
      );
      this.linesCount = this.lines.length;
    } else if (partial?.totalSplitQty) {
      this.totalSplitQty = new Decimal(partial.totalSplitQty);
    }
    if (partial?.linesCount !== undefined && !this.linesCount) {
      this.linesCount = partial.linesCount;
    }
  }
}

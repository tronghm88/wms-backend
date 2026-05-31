import { Decimal } from "decimal.js";
import { IssueTicketStatus } from "../enums";
import { IssueTicketLineEntity } from "./issue-ticket-line.entity";

export class IssueTicketEntity {
  id: number;
  code: string;
  date: Date;
  customerId: number;
  status: IssueTicketStatus;
  createdBy: number;
  totalAmount: Decimal;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
  lines: IssueTicketLineEntity[];
  createdByName?: string;
  customerName?: string;
  customerCode?: string;

  /** Enrichment fields — populated from the customer join, not stored on the ticket */
  customerAddress?: string | null;
  customerTaxCode?: string | null;
  customerPhone?: string | null;

  constructor(partial?: Partial<IssueTicketEntity>) {
    Object.assign(this, partial);
    if (partial?.totalAmount) {
      this.totalAmount = new Decimal(partial.totalAmount);
    }
    if (partial?.lines) {
      this.lines = partial.lines.map((line) => new IssueTicketLineEntity(line));
    }
  }
}

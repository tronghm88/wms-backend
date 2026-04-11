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

import { Decimal } from "decimal.js";
import { TransactionStatus } from "../enums";

export class IssueTicketEntity {
  id: number;
  ticketNo: string;
  date: Date;
  customerId: number;
  status: TransactionStatus;
  createdBy: number;
  totalAmount: Decimal;
  note?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<IssueTicketEntity>) {
    Object.assign(this, partial);
    if (partial?.totalAmount) {
      this.totalAmount = new Decimal(partial.totalAmount);
    }
  }
}

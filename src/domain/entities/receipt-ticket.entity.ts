import { TransactionStatus } from "../enums";

export class ReceiptTicketEntity {
  id: number;
  ticketNo: string;
  date: Date;
  status: TransactionStatus;
  createdBy: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<ReceiptTicketEntity>) {
    Object.assign(this, partial);
  }
}

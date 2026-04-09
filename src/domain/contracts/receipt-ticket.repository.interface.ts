import { TransactionStatus } from "../enums";
import { ReceiptTicketLineEntity } from "../entities/receipt-ticket-line.entity";
import { ReceiptTicketEntity } from "../entities/receipt-ticket.entity";

export const RECEIPT_TICKET_REPOSITORY = "RECEIPT_TICKET_REPOSITORY";

export interface IReceiptTicketRepository {
  findById(id: number): Promise<ReceiptTicketEntity | null>;
  findByTicketNo(ticketNo: string): Promise<ReceiptTicketEntity | null>;
  findAll(): Promise<ReceiptTicketEntity[]>;
  findMany(params: {
    skip?: number;
    take?: number;
    status?: TransactionStatus;
    creatorId?: number;
    fromDate?: Date;
    toDate?: Date;
    search?: string;
  }): Promise<{ items: ReceiptTicketEntity[]; total: number }>;
  getLastTicketNo(yearMonth: string): Promise<string | null>;
  create(
    ticket: Omit<ReceiptTicketEntity, "id" | "createdAt" | "updatedAt">,
  ): Promise<ReceiptTicketEntity>;
  update(
    id: number,
    ticket: Partial<ReceiptTicketEntity>,
  ): Promise<ReceiptTicketEntity>;
  addLine(
    line: Omit<ReceiptTicketLineEntity, "id" | "createdAt" | "updatedAt">,
  ): Promise<ReceiptTicketLineEntity>;
  findLineById(lineId: number): Promise<ReceiptTicketLineEntity | null>;
  updateLine(
    lineId: number,
    line: Partial<ReceiptTicketLineEntity>,
  ): Promise<ReceiptTicketLineEntity>;
  deleteLine(lineId: number): Promise<void>;
}

import { TransactionStatus } from "../enums";
import { ReceiptTicketLineEntity } from "../entities/receipt-ticket-line.entity";
import { ReceiptTicketEntity } from "../entities/receipt-ticket.entity";

export const RECEIPT_TICKET_REPOSITORY = "RECEIPT_TICKET_REPOSITORY";

export interface IReceiptTicketRepository {
  findById(id: number): Promise<ReceiptTicketEntity | null>;
  findWithLines(
    id: number,
  ): Promise<
    (ReceiptTicketEntity & { lines: ReceiptTicketLineEntity[] }) | null
  >;
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
  addLineWithStockAdjustment(
    line: Omit<ReceiptTicketLineEntity, "id" | "createdAt" | "updatedAt">,
    performedBy: number,
  ): Promise<ReceiptTicketLineEntity>;
  findLineById(lineId: number): Promise<ReceiptTicketLineEntity | null>;
  updateLine(
    lineId: number,
    line: Partial<ReceiptTicketLineEntity>,
  ): Promise<ReceiptTicketLineEntity>;
  deleteLine(lineId: number): Promise<void>;
  confirm(id: number, performedBy: number): Promise<ReceiptTicketEntity>;
  updateLineWithStockAdjustment(
    lineId: number,
    line: ReceiptTicketLineEntity,
    oldLine: ReceiptTicketLineEntity,
    performedBy: number,
  ): Promise<ReceiptTicketLineEntity>;
  deleteLineWithStockAdjustment(
    lineId: number,
    oldLine: ReceiptTicketLineEntity,
    performedBy: number,
  ): Promise<void>;
  delete(id: number): Promise<void>;
  deleteWithStockAdjustment(id: number, performedBy: number): Promise<void>;
  void(
    id: number,
    performedBy: number,
  ): Promise<{ ticket: ReceiptTicketEntity; warnings: string[] }>;
}

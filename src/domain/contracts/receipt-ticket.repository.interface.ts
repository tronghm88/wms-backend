import { ReceiptTicketEntity } from "../entities/receipt-ticket.entity";

export interface IReceiptTicketRepository {
  findById(id: number): Promise<ReceiptTicketEntity | null>;
  findByTicketNo(ticketNo: string): Promise<ReceiptTicketEntity | null>;
  findAll(): Promise<ReceiptTicketEntity[]>;
  getLastTicketNo(yearMonth: string): Promise<string | null>;
  create(
    ticket: Omit<ReceiptTicketEntity, "id" | "createdAt" | "updatedAt">,
  ): Promise<ReceiptTicketEntity>;
  update(
    id: number,
    ticket: Partial<ReceiptTicketEntity>,
  ): Promise<ReceiptTicketEntity>;
}

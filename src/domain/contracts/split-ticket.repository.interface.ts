import { SplitTicketEntity } from "../entities/split-ticket.entity";

export interface ISplitTicketRepository {
  findById(id: number): Promise<SplitTicketEntity | null>;
  findByTicketNo(ticketNo: string): Promise<SplitTicketEntity | null>;
  findAll(): Promise<SplitTicketEntity[]>;
  create(
    ticket: Omit<SplitTicketEntity, "id" | "createdAt" | "updatedAt" | "lines">,
  ): Promise<SplitTicketEntity>;
  update(
    id: number,
    ticket: Partial<SplitTicketEntity>,
  ): Promise<SplitTicketEntity>;
}

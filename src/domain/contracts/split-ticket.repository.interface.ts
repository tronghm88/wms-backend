import { SplitTicketEntity } from "../entities/split-ticket.entity";

export const SPLIT_TICKET_REPOSITORY = "SPLIT_TICKET_REPOSITORY";

export interface ISplitTicketRepository {
  findById(id: number): Promise<SplitTicketEntity | null>;
  findByTicketNo(ticketNo: string): Promise<SplitTicketEntity | null>;
  findAll(): Promise<SplitTicketEntity[]>;
  getLastTicketNo(yearMonth: string): Promise<string | null>;
  create(
    ticket: Omit<SplitTicketEntity, "id" | "createdAt" | "updatedAt" | "lines">,
  ): Promise<SplitTicketEntity>;
  update(
    id: number,
    ticket: Partial<SplitTicketEntity>,
  ): Promise<SplitTicketEntity>;
}

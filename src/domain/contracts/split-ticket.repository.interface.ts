import { TransactionStatus } from "../enums";
import { SplitTicketLineEntity } from "../entities/split-ticket-line.entity";
import { SplitTicketEntity } from "../entities/split-ticket.entity";
import { SplitStatsDto } from "../../application/dtos/split-stats.dto";

export const SPLIT_TICKET_REPOSITORY = "SPLIT_TICKET_REPOSITORY";

export interface ISplitTicketRepository {
  findById(id: number): Promise<SplitTicketEntity | null>;
  findByTicketNo(ticketNo: string): Promise<SplitTicketEntity | null>;
  findAll(): Promise<SplitTicketEntity[]>;
  findMany(params: {
    skip?: number;
    take?: number;
    status?: TransactionStatus;
    creatorId?: number;
    fromDate?: Date;
    toDate?: Date;
    search?: string;
  }): Promise<{ items: SplitTicketEntity[]; total: number }>;
  getLastTicketNo(yearMonth: string): Promise<string | null>;
  create(
    ticket: Omit<SplitTicketEntity, "id" | "createdAt" | "updatedAt" | "lines">,
  ): Promise<SplitTicketEntity>;
  update(
    id: number,
    ticket: Partial<SplitTicketEntity>,
  ): Promise<SplitTicketEntity>;
  addLines(
    ticketId: number,
    lines: Omit<
      SplitTicketLineEntity,
      "id" | "ticketId" | "createdAt" | "updatedAt"
    >[],
  ): Promise<SplitTicketLineEntity[]>;
  deleteLines(ticketId: number): Promise<void>;
  findLineById(lineId: number): Promise<SplitTicketLineEntity | null>;
  updateLine(
    lineId: number,
    line: Partial<SplitTicketLineEntity>,
  ): Promise<SplitTicketLineEntity>;
  deleteLine(lineId: number): Promise<void>;
  getStats(from: Date, to: Date): Promise<SplitStatsDto>;
}

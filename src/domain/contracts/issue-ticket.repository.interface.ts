import { Decimal } from "decimal.js";
import { IssueTicketEntity } from "../entities/issue-ticket.entity";
import { IssueTicketLineEntity } from "../entities/issue-ticket-line.entity";
import { IssueTicketStatus } from "../enums";

export const ISSUE_TICKET_REPOSITORY = "ISSUE_TICKET_REPOSITORY";

export interface IIssueTicketFindManyParams {
  skip: number;
  take: number;
  status?: IssueTicketStatus;
  customerId?: number;
  creatorId?: number;
  fromDate?: Date;
  toDate?: Date;
  search?: string;
}

export interface IIssueTicketStats {
  totalCount: number;
  totalLines: number;
  pendingCount: number;
  totalRevenue: string;
}

export interface IIssueTicketRepository {
  findById(id: number): Promise<IssueTicketEntity | null>;
  findByCode(code: string): Promise<IssueTicketEntity | null>;
  findAll(): Promise<IssueTicketEntity[]>;
  findMany(
    params: IIssueTicketFindManyParams,
  ): Promise<{ items: IssueTicketEntity[]; total: number }>;
  getLastCode(yearMonth: string): Promise<string | null>;
  create(
    ticket: Omit<IssueTicketEntity, "id" | "createdAt" | "updatedAt">,
  ): Promise<IssueTicketEntity>;
  update(
    id: number,
    ticket: Partial<Omit<IssueTicketEntity, "id" | "createdAt" | "updatedAt">>,
  ): Promise<IssueTicketEntity>;
  delete(id: number): Promise<void>;
  complete(id: number, performedBy: number): Promise<IssueTicketEntity>;
  cancel(
    id: number,
    performedBy: number,
  ): Promise<{ ticket: IssueTicketEntity; warnings: string[] }>;
  findLineById(lineId: number): Promise<IssueTicketLineEntity | null>;
  addLine(
    ticketId: number,
    line: Omit<
      IssueTicketLineEntity,
      "id" | "ticketId" | "createdAt" | "updatedAt"
    >,
    newTotalAmount: Decimal,
  ): Promise<IssueTicketLineEntity>;
  deleteLine(
    lineId: number,
    ticketId: number,
    newTotalAmount: Decimal,
  ): Promise<void>;
  getStats(fromDate: Date, toDate: Date): Promise<IIssueTicketStats>;
}

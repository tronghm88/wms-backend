import { IssueTicketEntity } from "../entities/issue-ticket.entity";

export const ISSUE_TICKET_REPOSITORY = "ISSUE_TICKET_REPOSITORY";

export interface IIssueTicketRepository {
  findById(id: number): Promise<IssueTicketEntity | null>;
  findByCode(code: string): Promise<IssueTicketEntity | null>;
  findAll(): Promise<IssueTicketEntity[]>;
  getLastCode(yearMonth: string): Promise<string | null>;
  create(
    ticket: Omit<IssueTicketEntity, "id" | "createdAt" | "updatedAt">,
  ): Promise<IssueTicketEntity>;
  update(
    id: number,
    ticket: Partial<Omit<IssueTicketEntity, "id" | "createdAt" | "updatedAt">>,
  ): Promise<IssueTicketEntity>;
  complete(id: number, performedBy: number): Promise<IssueTicketEntity>;
}

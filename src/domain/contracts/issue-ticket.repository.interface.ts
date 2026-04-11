import { IssueTicketEntity } from "../entities/issue-ticket.entity";

export const ISSUE_TICKET_REPOSITORY = "ISSUE_TICKET_REPOSITORY";

export interface IIssueTicketRepository {
  findById(id: number): Promise<IssueTicketEntity | null>;
  findByCode(code: string): Promise<IssueTicketEntity | null>;
  findAll(): Promise<IssueTicketEntity[]>;
  create(
    ticket: Omit<IssueTicketEntity, "id" | "createdAt" | "updatedAt" | "lines">,
  ): Promise<IssueTicketEntity>;
  update(
    id: number,
    ticket: Partial<IssueTicketEntity>,
  ): Promise<IssueTicketEntity>;
}

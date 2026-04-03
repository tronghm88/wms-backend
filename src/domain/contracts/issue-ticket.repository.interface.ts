import { IssueTicketEntity } from '../entities/issue-ticket.entity';

export interface IIssueTicketRepository {
  findById(id: number): Promise<IssueTicketEntity | null>;
  findByTicketNo(ticketNo: string): Promise<IssueTicketEntity | null>;
  findAll(): Promise<IssueTicketEntity[]>;
  create(ticket: Omit<IssueTicketEntity, 'id' | 'createdAt' | 'updatedAt' | 'lines'>): Promise<IssueTicketEntity>;
  update(id: number, ticket: Partial<IssueTicketEntity>): Promise<IssueTicketEntity>;
}

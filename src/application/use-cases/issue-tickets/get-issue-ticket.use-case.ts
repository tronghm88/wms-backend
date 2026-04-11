import { Inject, Injectable } from "@nestjs/common";
import {
  ISSUE_TICKET_REPOSITORY,
  type IIssueTicketRepository,
} from "../../../domain/contracts/issue-ticket.repository.interface";
import { IssueTicketEntity } from "../../../domain/entities/issue-ticket.entity";
import { IssueTicketNotFoundException } from "../../../domain/exceptions/issue-ticket.exceptions";

@Injectable()
export class GetIssueTicketUseCase {
  constructor(
    @Inject(ISSUE_TICKET_REPOSITORY)
    private readonly issueTicketRepository: IIssueTicketRepository,
  ) {}

  async execute(id: number): Promise<IssueTicketEntity> {
    const ticket = await this.issueTicketRepository.findById(id);
    if (!ticket) {
      throw new IssueTicketNotFoundException(id);
    }
    return ticket;
  }
}

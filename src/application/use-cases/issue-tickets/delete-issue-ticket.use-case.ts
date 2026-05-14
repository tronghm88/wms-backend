import { Inject, Injectable } from "@nestjs/common";
import {
  ISSUE_TICKET_REPOSITORY,
  type IIssueTicketRepository,
} from "../../../domain/contracts/issue-ticket.repository.interface";
import { IssueTicketStatus } from "../../../domain/enums";
import {
  IssueTicketNotFoundException,
  IssueTicketNotDraftException,
} from "../../../domain/exceptions/issue-ticket.exceptions";

@Injectable()
export class DeleteIssueTicketUseCase {
  constructor(
    @Inject(ISSUE_TICKET_REPOSITORY)
    private readonly issueTicketRepository: IIssueTicketRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const ticket = await this.issueTicketRepository.findById(id);
    if (!ticket) {
      throw new IssueTicketNotFoundException(id);
    }

    if (ticket.status !== IssueTicketStatus.DRAFT) {
      throw new IssueTicketNotDraftException(id);
    }

    await this.issueTicketRepository.delete(id);
  }
}

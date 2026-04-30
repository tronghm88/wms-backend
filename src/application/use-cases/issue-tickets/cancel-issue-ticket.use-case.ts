import { Inject, Injectable, Logger } from "@nestjs/common";
import {
  ISSUE_TICKET_REPOSITORY,
  type IIssueTicketRepository,
} from "../../../domain/contracts/issue-ticket.repository.interface";
import { IssueTicketEntity } from "../../../domain/entities/issue-ticket.entity";

@Injectable()
export class CancelIssueTicketUseCase {
  private readonly logger = new Logger(CancelIssueTicketUseCase.name);

  constructor(
    @Inject(ISSUE_TICKET_REPOSITORY)
    private readonly issueTicketRepository: IIssueTicketRepository,
  ) {}

  async execute(
    id: number,
    user: { id: number; permissions: string[]; role: string },
  ): Promise<{ ticket: IssueTicketEntity; warnings: string[] }> {
    this.logger.log(`Cancelling Issue Ticket ${id} by user ${user.id}`);

    const result = await this.issueTicketRepository.cancel(id, user.id);

    this.logger.log(
      `Issue Ticket ${result.ticket.code} cancelled successfully`,
    );

    return result;
  }
}

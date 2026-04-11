import { Inject, Injectable, Logger } from "@nestjs/common";
import {
  ISSUE_TICKET_REPOSITORY,
  type IIssueTicketRepository,
} from "../../../domain/contracts/issue-ticket.repository.interface";
import { IssueTicketEntity } from "../../../domain/entities/issue-ticket.entity";

@Injectable()
export class CompleteIssueTicketUseCase {
  private readonly logger = new Logger(CompleteIssueTicketUseCase.name);

  constructor(
    @Inject(ISSUE_TICKET_REPOSITORY)
    private readonly issueTicketRepository: IIssueTicketRepository,
  ) {}

  async execute(
    id: number,
    user: { id: number; permissions: string[]; role: string },
  ): Promise<IssueTicketEntity> {
    this.logger.log(`Completing Issue Ticket ${id} by user ${user.id}`);

    // The repository handles the transaction and stock movements
    const ticket = await this.issueTicketRepository.complete(id, user.id);

    this.logger.log(`Issue Ticket ${ticket.code} completed successfully`);

    return ticket;
  }
}

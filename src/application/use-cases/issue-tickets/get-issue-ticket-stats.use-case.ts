import { Inject, Injectable } from "@nestjs/common";
import {
  ISSUE_TICKET_REPOSITORY,
  type IIssueTicketRepository,
  type IIssueTicketStats,
} from "../../../domain/contracts/issue-ticket.repository.interface";

@Injectable()
export class GetIssueTicketStatsUseCase {
  constructor(
    @Inject(ISSUE_TICKET_REPOSITORY)
    private readonly issueTicketRepository: IIssueTicketRepository,
  ) {}

  async execute(
    fromDateParam?: string,
    toDateParam?: string,
  ): Promise<IIssueTicketStats> {
    let fromDate: Date;
    let toDate: Date;

    if (!fromDateParam && !toDateParam) {
      const now = new Date();
      fromDate = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          0,
          0,
          0,
          0,
        ),
      );
      toDate = now;
    } else if (fromDateParam && !toDateParam) {
      fromDate = new Date(fromDateParam);
      toDate = new Date();
    } else {
      fromDate = new Date(fromDateParam!);
      toDate = new Date(toDateParam!);
    }

    return await this.issueTicketRepository.getStats(fromDate, toDate);
  }
}

import { Inject, Injectable } from "@nestjs/common";
import type { ISplitTicketRepository } from "../../../domain/contracts/split-ticket.repository.interface";
import { SPLIT_TICKET_REPOSITORY } from "../../../domain/contracts/split-ticket.repository.interface";
import { SplitStatsDto } from "../../dtos/split-stats.dto";

@Injectable()
export class GetSplitTicketStatsUseCase {
  constructor(
    @Inject(SPLIT_TICKET_REPOSITORY)
    private readonly splitTicketRepository: ISplitTicketRepository,
  ) {}

  async execute(
    fromDateParam?: string,
    toDateParam?: string,
  ): Promise<SplitStatsDto> {
    let fromDate: Date;
    let toDate: Date;

    if (!fromDateParam && !toDateParam) {
      // Default to today (start of day UTC to now)
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

    return await this.splitTicketRepository.getStats(fromDate, toDate);
  }
}

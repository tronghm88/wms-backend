import { Inject, Injectable } from "@nestjs/common";
import type { IReceiptTicketRepository } from "../../../domain/contracts/receipt-ticket.repository.interface";
import { RECEIPT_TICKET_REPOSITORY } from "../../../domain/contracts/receipt-ticket.repository.interface";
import { ReceiptStatsDto } from "../../dtos/receipt-stats.dto";

@Injectable()
export class GetReceiptTicketStatsUseCase {
  constructor(
    @Inject(RECEIPT_TICKET_REPOSITORY)
    private readonly receiptTicketRepository: IReceiptTicketRepository,
  ) {}

  async execute(fromDateParam?: string, toDateParam?: string): Promise<ReceiptStatsDto> {
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

    return await this.receiptTicketRepository.getStats(fromDate, toDate);
  }
}

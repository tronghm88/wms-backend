import { Inject, Injectable } from "@nestjs/common";
import { RECEIPT_TICKET_REPOSITORY } from "../../../domain/contracts/receipt-ticket.repository.interface";
import type { IReceiptTicketRepository } from "../../../domain/contracts/receipt-ticket.repository.interface";
import { ReceiptTicketEntity } from "../../../domain/entities/receipt-ticket.entity";
import { TransactionStatus } from "../../../domain/enums";

export interface ListReceiptTicketsUseCaseInput {
  page: number;
  limit: number;
  status?: TransactionStatus;
  creatorId?: number;
  fromDate?: Date;
  toDate?: Date;
  search?: string;
}

export interface ListReceiptTicketsUseCaseOutput {
  data: ReceiptTicketEntity[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

@Injectable()
export class ListReceiptTicketsUseCase {
  constructor(
    @Inject(RECEIPT_TICKET_REPOSITORY)
    private readonly receiptTicketRepository: IReceiptTicketRepository,
  ) {}

  async execute(
    input: ListReceiptTicketsUseCaseInput,
  ): Promise<ListReceiptTicketsUseCaseOutput> {
    const { page, limit, status, creatorId, fromDate, toDate, search } = input;
    const skip = (page - 1) * limit;

    const { items, total } = await this.receiptTicketRepository.findMany({
      skip,
      take: limit,
      status,
      creatorId,
      fromDate,
      toDate,
      search,
    });

    return {
      data: items,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit) || 1,
      },
    };
  }
}

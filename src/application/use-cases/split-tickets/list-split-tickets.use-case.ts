import { Inject, Injectable } from "@nestjs/common";
import { SPLIT_TICKET_REPOSITORY } from "../../../domain/contracts/split-ticket.repository.interface";
import type { ISplitTicketRepository } from "../../../domain/contracts/split-ticket.repository.interface";
import { SplitTicketEntity } from "../../../domain/entities/split-ticket.entity";
import { TransactionStatus } from "../../../domain/enums";

export interface ListSplitTicketsUseCaseInput {
  page: number;
  limit: number;
  status?: TransactionStatus;
  creatorId?: number;
  fromDate?: Date;
  toDate?: Date;
  search?: string;
}

export interface ListSplitTicketsUseCaseOutput {
  data: SplitTicketEntity[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

@Injectable()
export class ListSplitTicketsUseCase {
  constructor(
    @Inject(SPLIT_TICKET_REPOSITORY)
    private readonly splitTicketRepository: ISplitTicketRepository,
  ) {}

  async execute(
    input: ListSplitTicketsUseCaseInput,
  ): Promise<ListSplitTicketsUseCaseOutput> {
    const { page, limit, status, creatorId, fromDate, toDate, search } = input;
    const skip = (page - 1) * limit;

    const { items, total } = await this.splitTicketRepository.findMany({
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

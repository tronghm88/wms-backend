import { Inject, Injectable } from "@nestjs/common";
import { ISSUE_TICKET_REPOSITORY } from "../../../domain/contracts/issue-ticket.repository.interface";
import type { IIssueTicketRepository } from "../../../domain/contracts/issue-ticket.repository.interface";
import { IssueTicketEntity } from "../../../domain/entities/issue-ticket.entity";
import { IssueTicketStatus } from "../../../domain/enums";

export interface ListIssueTicketsUseCaseInput {
  page: number;
  limit: number;
  status?: IssueTicketStatus;
  customerId?: number;
  creatorId?: number;
  fromDate?: Date;
  toDate?: Date;
  search?: string;
}

export interface ListIssueTicketsUseCaseOutput {
  data: IssueTicketEntity[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

@Injectable()
export class ListIssueTicketsUseCase {
  constructor(
    @Inject(ISSUE_TICKET_REPOSITORY)
    private readonly issueTicketRepository: IIssueTicketRepository,
  ) {}

  async execute(
    input: ListIssueTicketsUseCaseInput,
  ): Promise<ListIssueTicketsUseCaseOutput> {
    const {
      page,
      limit,
      status,
      customerId,
      creatorId,
      fromDate,
      toDate,
      search,
    } = input;
    const skip = (page - 1) * limit;

    const { items, total } = await this.issueTicketRepository.findMany({
      skip,
      take: limit,
      status,
      customerId,
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

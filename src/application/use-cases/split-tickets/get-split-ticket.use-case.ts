import { Inject, Injectable } from "@nestjs/common";
import {
  SPLIT_TICKET_REPOSITORY,
  type ISplitTicketRepository,
} from "../../../domain/contracts/split-ticket.repository.interface";
import { SplitTicketEntity } from "../../../domain/entities/split-ticket.entity";
import { SplitTicketLineEntity } from "../../../domain/entities/split-ticket-line.entity";
import { SplitTicketNotFoundException } from "../../../domain/exceptions/split-ticket.exceptions";

export type GetSplitTicketUseCaseOutput = SplitTicketEntity & {
  lines: SplitTicketLineEntity[];
};

@Injectable()
export class GetSplitTicketUseCase {
  constructor(
    @Inject(SPLIT_TICKET_REPOSITORY)
    private readonly splitTicketRepository: ISplitTicketRepository,
  ) {}

  async execute(id: number): Promise<GetSplitTicketUseCaseOutput> {
    const ticket = await this.splitTicketRepository.findWithDetails(id);
    if (!ticket) {
      throw new SplitTicketNotFoundException(id);
    }
    return ticket;
  }
}

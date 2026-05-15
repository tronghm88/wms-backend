import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import {
  SPLIT_TICKET_REPOSITORY,
  type ISplitTicketRepository,
} from "../../../domain/contracts/split-ticket.repository.interface";
import { TransactionStatus } from "../../../domain/enums";

@Injectable()
export class DeleteSplitTicketLineUseCase {
  constructor(
    @Inject(SPLIT_TICKET_REPOSITORY)
    private readonly splitTicketRepository: ISplitTicketRepository,
  ) {}

  async execute(ticketId: number, lineId: number): Promise<void> {
    const ticket = await this.splitTicketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException(`Split Ticket with ID ${ticketId} not found`);
    }

    if (ticket.status !== TransactionStatus.DRAFT) {
      throw new BadRequestException(
        "Only Pending (Draft) tickets can be modified",
      );
    }

    const line = await this.splitTicketRepository.findLineById(lineId);
    if (!line || line.ticketId !== ticketId) {
      throw new NotFoundException(
        `Line with ID ${lineId} not found in this ticket`,
      );
    }

    await this.splitTicketRepository.deleteLine(lineId);
  }
}

import { Inject, Injectable } from "@nestjs/common";
import {
  RECEIPT_TICKET_REPOSITORY,
  type IReceiptTicketRepository,
} from "../../../domain/contracts/receipt-ticket.repository.interface";
import { TransactionStatus } from "../../../domain/enums";
import {
  ReceiptTicketNotFoundException,
  ReceiptTicketNotDraftException,
  ReceiptTicketLineNotFoundException,
} from "../../../domain/exceptions/receipt-ticket.exceptions";

@Injectable()
export class DeleteReceiptLineUseCase {
  constructor(
    @Inject(RECEIPT_TICKET_REPOSITORY)
    private readonly receiptTicketRepository: IReceiptTicketRepository,
  ) {}

  async execute(
    ticketId: number,
    lineId: number,
    isAdmin: boolean,
    userId: number,
  ): Promise<void> {
    // 1. Check ticket
    const ticket = await this.receiptTicketRepository.findById(ticketId);
    if (!ticket) {
      throw new ReceiptTicketNotFoundException(ticketId);
    }

    // 2. Check draft status (unless admin)
    if (ticket.status !== TransactionStatus.DRAFT && !isAdmin) {
      throw new ReceiptTicketNotDraftException(ticketId);
    }

    // 3. Check line exists and belongs to ticket
    const existingLine =
      await this.receiptTicketRepository.findLineById(lineId);
    if (!existingLine || existingLine.ticketId !== ticketId) {
      throw new ReceiptTicketLineNotFoundException(lineId);
    }

    // 4. Perform delete (with stock adjustment if confirmed)
    if (ticket.status === TransactionStatus.CONFIRMED && isAdmin) {
      await this.receiptTicketRepository.deleteLineWithStockAdjustment(
        lineId,
        existingLine,
        userId,
      );
    } else {
      await this.receiptTicketRepository.deleteLine(lineId);
    }
  }
}

import { Inject, Injectable } from "@nestjs/common";
import {
  RECEIPT_TICKET_REPOSITORY,
  type IReceiptTicketRepository,
} from "../../../domain/contracts/receipt-ticket.repository.interface";
import { TransactionStatus } from "../../../domain/enums";
import {
  ReceiptTicketNotFoundException,
  ReceiptTicketNotDraftException,
} from "../../../domain/exceptions/receipt-ticket.exceptions";

@Injectable()
export class DeleteReceiptTicketUseCase {
  constructor(
    @Inject(RECEIPT_TICKET_REPOSITORY)
    private readonly receiptTicketRepository: IReceiptTicketRepository,
  ) {}

  async execute(id: number, isAdmin: boolean, userId: number): Promise<void> {
    // 1. Check ticket
    const ticket = await this.receiptTicketRepository.findById(id);
    if (!ticket) {
      throw new ReceiptTicketNotFoundException(id);
    }

    // 2. Check draft status (unless admin)
    if (ticket.status !== TransactionStatus.DRAFT && !isAdmin) {
      throw new ReceiptTicketNotDraftException(id);
    }

    // 3. Perform delete (with stock adjustment if confirmed)
    if (ticket.status === TransactionStatus.CONFIRMED && isAdmin) {
      await this.receiptTicketRepository.deleteWithStockAdjustment(id, userId);
    } else {
      await this.receiptTicketRepository.delete(id);
    }
  }
}

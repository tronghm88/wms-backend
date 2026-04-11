import { Inject, Injectable } from "@nestjs/common";
import {
  RECEIPT_TICKET_REPOSITORY,
  type IReceiptTicketRepository,
} from "../../../domain/contracts/receipt-ticket.repository.interface";
import { ReceiptTicketEntity } from "../../../domain/entities/receipt-ticket.entity";
import { TransactionStatus } from "../../../domain/enums";
import {
  ReceiptTicketNotFoundException,
  ReceiptTicketNotDraftException,
} from "../../../domain/exceptions/receipt-ticket.exceptions";

@Injectable()
export class ConfirmReceiptTicketUseCase {
  constructor(
    @Inject(RECEIPT_TICKET_REPOSITORY)
    private readonly receiptTicketRepository: IReceiptTicketRepository,
  ) {}

  async execute(id: number, userId: number): Promise<ReceiptTicketEntity> {
    // 1. Check ticket existence
    const ticket = await this.receiptTicketRepository.findById(id);
    if (!ticket) {
      throw new ReceiptTicketNotFoundException(id);
    }

    // 2. Check if ticket is in DRAFT status
    if (ticket.status !== TransactionStatus.DRAFT) {
      throw new ReceiptTicketNotDraftException(id);
    }

    // 3. Confirm ticket (status update, stock update, audit log in one transaction)
    return await this.receiptTicketRepository.confirm(id, userId);
  }
}

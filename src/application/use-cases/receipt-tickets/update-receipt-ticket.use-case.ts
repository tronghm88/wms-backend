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
import { UpdateReceiptTicketDto } from "../../dtos/update-receipt-ticket.dto";
import { ReceiptTicketEntity } from "../../../domain/entities/receipt-ticket.entity";

@Injectable()
export class UpdateReceiptTicketUseCase {
  constructor(
    @Inject(RECEIPT_TICKET_REPOSITORY)
    private readonly receiptTicketRepository: IReceiptTicketRepository,
  ) {}

  async execute(
    ticketId: number,
    dto: UpdateReceiptTicketDto,
    isAdmin: boolean,
  ): Promise<ReceiptTicketEntity> {
    const ticket = await this.receiptTicketRepository.findById(ticketId);
    if (!ticket) {
      throw new ReceiptTicketNotFoundException(ticketId);
    }

    // Only allow updates to DRAFT tickets unless the user is an ADMIN
    if (ticket.status !== TransactionStatus.DRAFT && !isAdmin) {
      throw new ReceiptTicketNotDraftException(ticketId);
    }

    // Update only the fields that are provided in the DTO
    return await this.receiptTicketRepository.update(ticketId, {
      note: dto.note !== undefined ? dto.note : undefined,
      supplierName:
        dto.supplierName !== undefined ? dto.supplierName : undefined,
      invoiceNo: dto.invoiceNo !== undefined ? dto.invoiceNo : undefined,
      invoiceDate: dto.invoiceDate !== undefined ? dto.invoiceDate : undefined,
    });
  }
}

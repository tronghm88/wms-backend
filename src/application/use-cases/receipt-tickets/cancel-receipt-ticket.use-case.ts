import { Inject, Injectable } from "@nestjs/common";
import {
  RECEIPT_TICKET_REPOSITORY,
  type IReceiptTicketRepository,
} from "../../../domain/contracts/receipt-ticket.repository.interface";
import { ReceiptTicketEntity } from "../../../domain/entities/receipt-ticket.entity";

export interface CancelReceiptTicketUseCaseOutput {
  ticket: ReceiptTicketEntity;
  warnings: string[];
}

@Injectable()
export class CancelReceiptTicketUseCase {
  constructor(
    @Inject(RECEIPT_TICKET_REPOSITORY)
    private readonly receiptTicketRepository: IReceiptTicketRepository,
  ) {}

  async execute(
    id: number,
    userId: number,
  ): Promise<CancelReceiptTicketUseCaseOutput> {
    return await this.receiptTicketRepository.cancel(id, userId);
  }
}

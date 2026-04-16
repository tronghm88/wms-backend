import { Inject, Injectable } from "@nestjs/common";
import {
  RECEIPT_TICKET_REPOSITORY,
  type IReceiptTicketRepository,
} from "../../../domain/contracts/receipt-ticket.repository.interface";
import { ReceiptTicketEntity } from "../../../domain/entities/receipt-ticket.entity";

export interface VoidReceiptTicketUseCaseOutput {
  ticket: ReceiptTicketEntity;
  warnings: string[];
}

@Injectable()
export class VoidReceiptTicketUseCase {
  constructor(
    @Inject(RECEIPT_TICKET_REPOSITORY)
    private readonly receiptTicketRepository: IReceiptTicketRepository,
  ) {}

  async execute(
    id: number,
    userId: number,
  ): Promise<VoidReceiptTicketUseCaseOutput> {
    return await this.receiptTicketRepository.void(id, userId);
  }
}

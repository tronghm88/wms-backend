import { Inject, Injectable } from "@nestjs/common";
import { Decimal } from "decimal.js";
import {
  RECEIPT_TICKET_REPOSITORY,
  type IReceiptTicketRepository,
} from "../../../domain/contracts/receipt-ticket.repository.interface";
import { ReceiptTicketEntity } from "../../../domain/entities/receipt-ticket.entity";
import { ReceiptTicketLineEntity } from "../../../domain/entities/receipt-ticket-line.entity";
import { ReceiptTicketNotFoundException } from "../../../domain/exceptions/receipt-ticket.exceptions";

export interface GetReceiptTicketUseCaseOutput extends ReceiptTicketEntity {
  lines: ReceiptTicketLineEntity[];
  totalM2: Decimal;
  totalKg: Decimal;
  totalRolls: Decimal;
}

@Injectable()
export class GetReceiptTicketUseCase {
  constructor(
    @Inject(RECEIPT_TICKET_REPOSITORY)
    private readonly receiptTicketRepository: IReceiptTicketRepository,
  ) {}

  async execute(id: number): Promise<GetReceiptTicketUseCaseOutput> {
    const ticket = await this.receiptTicketRepository.findWithLines(id);
    if (!ticket) {
      throw new ReceiptTicketNotFoundException(id);
    }

    let totalM2 = new Decimal(0);
    let totalKg = new Decimal(0);
    let totalRolls = new Decimal(0);

    for (const line of ticket.lines) {
      if (line.areaM2) {
        totalM2 = totalM2.plus(line.areaM2);
      }
      if (line.weightKg) {
        totalKg = totalKg.plus(line.weightKg);
      }
      if (line.unitCode === "roll") {
        totalRolls = totalRolls.plus(line.quantity);
      }
    }

    return {
      ...ticket,
      totalM2,
      totalKg,
      totalRolls,
    };
  }
}

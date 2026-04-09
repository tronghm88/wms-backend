import { Inject, Injectable } from "@nestjs/common";
import {
  RECEIPT_TICKET_REPOSITORY,
  type IReceiptTicketRepository,
} from "../../../domain/contracts/receipt-ticket.repository.interface";
import { ReceiptTicketEntity } from "../../../domain/entities/receipt-ticket.entity";
import { TransactionStatus } from "../../../domain/enums";
import { CreateReceiptTicketDto } from "../../dtos/create-receipt-ticket.dto";

@Injectable()
export class CreateReceiptTicketUseCase {
  constructor(
    @Inject(RECEIPT_TICKET_REPOSITORY)
    private readonly receiptTicketRepository: IReceiptTicketRepository,
  ) {}

  async execute(
    dto: CreateReceiptTicketDto,
    userId: number,
  ): Promise<ReceiptTicketEntity> {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const yearMonth = `${year}${month}`;

    let retryCount = 0;
    const MAX_RETRIES = 5;

    while (retryCount < MAX_RETRIES) {
      const lastTicketNo =
        await this.receiptTicketRepository.getLastTicketNo(yearMonth);

      let nextNumber = 1;
      if (lastTicketNo) {
        const parts = lastTicketNo.split("-");
        const lastN = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastN)) {
          nextNumber = lastN + 1;
        }
      }

      const ticketNo = `PN-${yearMonth}-${nextNumber}`;

      try {
        const ticket = new ReceiptTicketEntity({
          ticketNo,
          date: now,
          status: TransactionStatus.DRAFT,
          createdBy: userId,
          note: dto.note,
        });

        return await this.receiptTicketRepository.create(ticket);
      } catch (err: unknown) {
        // P2002 is Prisma error for unique constraint violation
        if (
          err &&
          typeof err === "object" &&
          "code" in err &&
          err.code === "P2002"
        ) {
          retryCount++;
          continue;
        }
        throw err;
      }
    }

    throw new Error(
      "Failed to generate a unique ticket number after max retries.",
    );
  }
}

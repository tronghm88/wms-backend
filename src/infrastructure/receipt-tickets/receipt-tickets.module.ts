import { Module } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { ReceiptTicketRepository } from "../database/repositories/receipt-ticket.repository";
import { CreateReceiptTicketUseCase } from "../../application/use-cases/receipt-tickets/create-receipt-ticket.use-case";
import { ReceiptTicketsController } from "../../presentation/controllers/receipt-tickets.controller";

@Module({
  imports: [PrismaModule],
  controllers: [ReceiptTicketsController],
  providers: [
    CreateReceiptTicketUseCase,
    {
      provide: "IReceiptTicketRepository",
      useClass: ReceiptTicketRepository,
    },
  ],
  exports: ["IReceiptTicketRepository"],
})
export class ReceiptTicketsModule {}

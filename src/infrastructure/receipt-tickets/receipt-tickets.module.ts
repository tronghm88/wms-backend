import { Module } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { ReceiptTicketRepository } from "../database/repositories/receipt-ticket.repository";
import { RECEIPT_TICKET_REPOSITORY } from "../../domain/contracts/receipt-ticket.repository.interface";
import { CreateReceiptTicketUseCase } from "../../application/use-cases/receipt-tickets/create-receipt-ticket.use-case";
import { AddReceiptLineUseCase } from "../../application/use-cases/receipt-tickets/add-receipt-line.use-case";
import { UpdateReceiptLineUseCase } from "../../application/use-cases/receipt-tickets/update-receipt-line.use-case";
import { DeleteReceiptLineUseCase } from "../../application/use-cases/receipt-tickets/delete-receipt-line.use-case";
import { ListReceiptTicketsUseCase } from "../../application/use-cases/receipt-tickets/list-receipt-tickets.use-case";
import { GetReceiptTicketUseCase } from "../../application/use-cases/receipt-tickets/get-receipt-ticket.use-case";
import { ConfirmReceiptTicketUseCase } from "../../application/use-cases/receipt-tickets/confirm-receipt-ticket.use-case";
import { VoidReceiptTicketUseCase } from "../../application/use-cases/receipt-tickets/void-receipt-ticket.use-case";
import { DeleteReceiptTicketUseCase } from "../../application/use-cases/receipt-tickets/delete-receipt-ticket.use-case";
import { UpdateReceiptTicketUseCase } from "../../application/use-cases/receipt-tickets/update-receipt-ticket.use-case";
import { ReceiptTicketsController } from "../../presentation/controllers/receipt-tickets.controller";
import { ProductsModule } from "../products/products.module";
import { UnitConversionsModule } from "../unit-conversions/unit-conversions.module";
import { UnitsModule } from "../units/units.module";

@Module({
  imports: [PrismaModule, ProductsModule, UnitConversionsModule, UnitsModule],
  controllers: [ReceiptTicketsController],
  providers: [
    CreateReceiptTicketUseCase,
    AddReceiptLineUseCase,
    UpdateReceiptLineUseCase,
    DeleteReceiptLineUseCase,
    ListReceiptTicketsUseCase,
    GetReceiptTicketUseCase,
    ConfirmReceiptTicketUseCase,
    VoidReceiptTicketUseCase,
    DeleteReceiptTicketUseCase,
    UpdateReceiptTicketUseCase,
    {
      provide: RECEIPT_TICKET_REPOSITORY,
      useClass: ReceiptTicketRepository,
    },
  ],
  exports: [RECEIPT_TICKET_REPOSITORY],
})
export class ReceiptTicketsModule {}

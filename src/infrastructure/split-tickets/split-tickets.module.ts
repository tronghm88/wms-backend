import { Module } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { SplitTicketRepository } from "../database/repositories/split-ticket.repository";
import { SPLIT_TICKET_REPOSITORY } from "../../domain/contracts/split-ticket.repository.interface";
import { CreateSplitTicketUseCase } from "../../application/use-cases/split-tickets/create-split-ticket.use-case";
import { AddSplitTicketLinesUseCase } from "../../application/use-cases/split-tickets/add-split-ticket-lines.use-case";
import { ConfirmSplitTicketUseCase } from "../../application/use-cases/split-tickets/confirm-split-ticket.use-case";
import { VoidSplitTicketUseCase } from "../../application/use-cases/split-tickets/void-split-ticket.use-case";
import { SplitTicketsController } from "../../presentation/controllers/split-tickets.controller";
import { ProductsModule } from "../products/products.module";
import { UnitConversionsModule } from "../unit-conversions/unit-conversions.module";
import { StockModule } from "../stock/stock.module";

@Module({
  imports: [PrismaModule, ProductsModule, UnitConversionsModule, StockModule],
  controllers: [SplitTicketsController],
  providers: [
    CreateSplitTicketUseCase,
    AddSplitTicketLinesUseCase,
    ConfirmSplitTicketUseCase,
    VoidSplitTicketUseCase,
    {
      provide: SPLIT_TICKET_REPOSITORY,
      useClass: SplitTicketRepository,
    },
  ],
  exports: [SPLIT_TICKET_REPOSITORY],
})
export class SplitTicketsModule {}

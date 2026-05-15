import { Module } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { SplitTicketRepository } from "../database/repositories/split-ticket.repository";
import { SPLIT_TICKET_REPOSITORY } from "../../domain/contracts/split-ticket.repository.interface";
import { CreateSplitTicketUseCase } from "../../application/use-cases/split-tickets/create-split-ticket.use-case";
import { AddSplitTicketLinesUseCase } from "../../application/use-cases/split-tickets/add-split-ticket-lines.use-case";
import { ConfirmSplitTicketUseCase } from "../../application/use-cases/split-tickets/confirm-split-ticket.use-case";
import { CancelSplitTicketUseCase } from "../../application/use-cases/split-tickets/cancel-split-ticket.use-case";
import { ListSplitTicketsUseCase } from "../../application/use-cases/split-tickets/list-split-tickets.use-case";
import { UpdateSplitTicketLineUseCase } from "../../application/use-cases/split-tickets/update-split-ticket-line.use-case";
import { DeleteSplitTicketLineUseCase } from "../../application/use-cases/split-tickets/delete-split-ticket-line.use-case";
import { UpdateSplitTicketUseCase } from "../../application/use-cases/split-tickets/update-split-ticket.use-case";
import { GetSplitTicketStatsUseCase } from "../../application/use-cases/split-tickets/get-split-ticket-stats.use-case";
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
    CancelSplitTicketUseCase,
    ListSplitTicketsUseCase,
    UpdateSplitTicketLineUseCase,
    DeleteSplitTicketLineUseCase,
    UpdateSplitTicketUseCase,
    GetSplitTicketStatsUseCase,
    {
      provide: SPLIT_TICKET_REPOSITORY,
      useClass: SplitTicketRepository,
    },
  ],
  exports: [SPLIT_TICKET_REPOSITORY],
})
export class SplitTicketsModule {}

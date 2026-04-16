import { Module } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { SplitTicketRepository } from "../database/repositories/split-ticket.repository";
import { SPLIT_TICKET_REPOSITORY } from "../../domain/contracts/split-ticket.repository.interface";
import { CreateSplitTicketUseCase } from "../../application/use-cases/split-tickets/create-split-ticket.use-case";
import { AddSplitTicketLinesUseCase } from "../../application/use-cases/split-tickets/add-split-ticket-lines.use-case";
import { SplitTicketsController } from "../../presentation/controllers/split-tickets.controller";
import { ProductsModule } from "../products/products.module";
import { UnitConversionsModule } from "../unit-conversions/unit-conversions.module";

@Module({
  imports: [PrismaModule, ProductsModule, UnitConversionsModule],
  controllers: [SplitTicketsController],
  providers: [
    CreateSplitTicketUseCase,
    AddSplitTicketLinesUseCase,
    {
      provide: SPLIT_TICKET_REPOSITORY,
      useClass: SplitTicketRepository,
    },
  ],
  exports: [SPLIT_TICKET_REPOSITORY],
})
export class SplitTicketsModule {}

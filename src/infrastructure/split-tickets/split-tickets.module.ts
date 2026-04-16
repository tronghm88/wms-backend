import { Module } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { SplitTicketRepository } from "../database/repositories/split-ticket.repository";
import { SPLIT_TICKET_REPOSITORY } from "../../domain/contracts/split-ticket.repository.interface";
import { CreateSplitTicketUseCase } from "../../application/use-cases/split-tickets/create-split-ticket.use-case";
import { SplitTicketsController } from "../../presentation/controllers/split-tickets.controller";
import { ProductsModule } from "../products/products.module";

@Module({
  imports: [PrismaModule, ProductsModule],
  controllers: [SplitTicketsController],
  providers: [
    CreateSplitTicketUseCase,
    {
      provide: SPLIT_TICKET_REPOSITORY,
      useClass: SplitTicketRepository,
    },
  ],
  exports: [SPLIT_TICKET_REPOSITORY],
})
export class SplitTicketsModule {}

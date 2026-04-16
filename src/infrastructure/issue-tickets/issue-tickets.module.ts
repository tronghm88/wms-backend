import { Module } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { PrismaIssueTicketRepository } from "../database/repositories/prisma-issue-ticket.repository";
import { ISSUE_TICKET_REPOSITORY } from "../../domain/contracts/issue-ticket.repository.interface";
import { CreateIssueTicketUseCase } from "../../application/use-cases/issue-tickets/create-issue-ticket.use-case";
import { CompleteIssueTicketUseCase } from "../../application/use-cases/issue-tickets/complete-issue-ticket.use-case";
import { GetIssueTicketUseCase } from "../../application/use-cases/issue-tickets/get-issue-ticket.use-case";
import { VoidIssueTicketUseCase } from "../../application/use-cases/issue-tickets/void-issue-ticket.use-case";
import { ProductsModule } from "../products/products.module";
import { CustomersModule } from "../customers/customers.module";
import { DiscountPoliciesModule } from "../discount-policies/discount-policies.module";
import { StockModule } from "../stock/stock.module";
import { IssueTicketsController } from "../../presentation/controllers/issue-tickets.controller";

@Module({
  imports: [
    PrismaModule,
    ProductsModule,
    CustomersModule,
    DiscountPoliciesModule,
    StockModule,
  ],
  controllers: [IssueTicketsController],
  providers: [
    CreateIssueTicketUseCase,
    CompleteIssueTicketUseCase,
    GetIssueTicketUseCase,
    VoidIssueTicketUseCase,
    {
      provide: ISSUE_TICKET_REPOSITORY,
      useClass: PrismaIssueTicketRepository,
    },
  ],
  exports: [
    ISSUE_TICKET_REPOSITORY,
    CreateIssueTicketUseCase,
    CompleteIssueTicketUseCase,
    GetIssueTicketUseCase,
    VoidIssueTicketUseCase,
  ],
})
export class IssueTicketsModule {}

import { Module } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { PrismaIssueTicketRepository } from "../database/repositories/issue-ticket.repository";
import { ISSUE_TICKET_REPOSITORY } from "../../domain/contracts/issue-ticket.repository.interface";
import { CreateIssueTicketUseCase } from "../../application/use-cases/issue-tickets/create-issue-ticket.use-case";
import { CompleteIssueTicketUseCase } from "../../application/use-cases/issue-tickets/complete-issue-ticket.use-case";
import { GetIssueTicketUseCase } from "../../application/use-cases/issue-tickets/get-issue-ticket.use-case";
import { CancelIssueTicketUseCase } from "../../application/use-cases/issue-tickets/cancel-issue-ticket.use-case";
import { DeleteIssueTicketUseCase } from "../../application/use-cases/issue-tickets/delete-issue-ticket.use-case";
import { UpdateIssueTicketUseCase } from "../../application/use-cases/issue-tickets/update-issue-ticket.use-case";
import { AddIssueLineUseCase } from "../../application/use-cases/issue-tickets/add-issue-line.use-case";
import { DeleteIssueLineUseCase } from "../../application/use-cases/issue-tickets/delete-issue-line.use-case";
import { GetIssueTicketStatsUseCase } from "../../application/use-cases/issue-tickets/get-issue-ticket-stats.use-case";
import { ListIssueTicketsUseCase } from "../../application/use-cases/issue-tickets/list-issue-tickets.use-case";
import { ProductsModule } from "../products/products.module";
import { CustomersModule } from "../customers/customers.module";
import { DiscountPoliciesModule } from "../discount-policies/discount-policies.module";
import { StockModule } from "../stock/stock.module";
import { IssueTicketsController } from "../../presentation/controllers/issue-tickets.controller";
import { ExportIssueTicketUseCase } from "../../application/use-cases/issue-tickets/export-issue-ticket.use-case";
import { ExcelExportService } from "../services/excel-export.service";

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
    CancelIssueTicketUseCase,
    DeleteIssueTicketUseCase,
    UpdateIssueTicketUseCase,
    AddIssueLineUseCase,
    DeleteIssueLineUseCase,
    GetIssueTicketStatsUseCase,
    ListIssueTicketsUseCase,
    ExportIssueTicketUseCase,
    ExcelExportService,
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
    CancelIssueTicketUseCase,
  ],
})
export class IssueTicketsModule {}

import { Module } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { IssueTicketRepository } from "../database/repositories/issue-ticket.repository";
import { ISSUE_TICKET_REPOSITORY } from "../../domain/contracts/issue-ticket.repository.interface";
import { CreateIssueTicketUseCase } from "../../application/use-cases/issue-tickets/create-issue-ticket.use-case";

@Module({
  imports: [PrismaModule],
  providers: [
    CreateIssueTicketUseCase,
    {
      provide: ISSUE_TICKET_REPOSITORY,
      useClass: IssueTicketRepository,
    },
  ],
  exports: [ISSUE_TICKET_REPOSITORY, CreateIssueTicketUseCase],
})
export class IssueTicketsModule {}

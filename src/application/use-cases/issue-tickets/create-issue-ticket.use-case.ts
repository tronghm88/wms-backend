import { Inject, Injectable } from "@nestjs/common";
import {
  ISSUE_TICKET_REPOSITORY,
  type IIssueTicketRepository,
} from "../../../domain/contracts/issue-ticket.repository.interface";
import { IssueTicketEntity } from "../../../domain/entities/issue-ticket.entity";
import { IssueTicketStatus } from "../../../domain/enums";
import { IssueTicketCodeGenerator } from "../../../domain/services/issue-ticket-code-generator.service";
import { CreateIssueTicketDto } from "../../dtos/create-issue-ticket.dto";
import { Decimal } from "decimal.js";

@Injectable()
export class CreateIssueTicketUseCase {
  constructor(
    @Inject(ISSUE_TICKET_REPOSITORY)
    private readonly issueTicketRepository: IIssueTicketRepository,
  ) {}

  async execute(
    dto: CreateIssueTicketDto,
    userId: number,
  ): Promise<IssueTicketEntity> {
    const now = new Date();

    let retryCount = 0;
    const MAX_RETRIES = 5;

    while (retryCount < MAX_RETRIES) {
      const code = await IssueTicketCodeGenerator.generateNextCode(
        this.issueTicketRepository,
        now,
      );

      try {
        const ticket = new IssueTicketEntity({
          code,
          date: now,
          customerId: dto.customerId,
          status: IssueTicketStatus.DRAFT,
          createdBy: userId,
          totalAmount: new Decimal(0),
          note: dto.note,
          lines: [],
        });

        return await this.issueTicketRepository.create(ticket);
      } catch (err: unknown) {
        // P2002 is Prisma error for unique constraint violation on 'ticketNo'
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
      "Failed to generate a unique export ticket code after max retries.",
    );
  }
}

import { Inject, Injectable } from "@nestjs/common";
import {
  ISSUE_TICKET_REPOSITORY,
  type IIssueTicketRepository,
} from "../../../domain/contracts/issue-ticket.repository.interface";
import { IssueTicketEntity } from "../../../domain/entities/issue-ticket.entity";
import { IssueTicketStatus } from "../../../domain/enums";
import {
  IssueTicketNotFoundException,
  IssueTicketNotDraftException,
} from "../../../domain/exceptions/issue-ticket.exceptions";
import { UpdateIssueTicketDto } from "../../dtos/update-issue-ticket.dto";

@Injectable()
export class UpdateIssueTicketUseCase {
  constructor(
    @Inject(ISSUE_TICKET_REPOSITORY)
    private readonly issueTicketRepository: IIssueTicketRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdateIssueTicketDto,
  ): Promise<IssueTicketEntity> {
    const ticket = await this.issueTicketRepository.findById(id);
    if (!ticket) {
      throw new IssueTicketNotFoundException(id);
    }

    if (ticket.status !== IssueTicketStatus.DRAFT) {
      throw new IssueTicketNotDraftException(id);
    }

    return await this.issueTicketRepository.update(id, {
      note: dto.note !== undefined ? (dto.note ?? undefined) : undefined,
      date: dto.date !== undefined ? dto.date : undefined,
    });
  }
}

import { Inject, Injectable } from "@nestjs/common";
import {
  ISSUE_TICKET_REPOSITORY,
  type IIssueTicketRepository,
} from "../../../domain/contracts/issue-ticket.repository.interface";
import { IssueTicketStatus } from "../../../domain/enums";
import {
  IssueTicketNotFoundException,
  IssueTicketNotDraftException,
  IssueTicketLineNotFoundException,
} from "../../../domain/exceptions/issue-ticket.exceptions";

@Injectable()
export class DeleteIssueLineUseCase {
  constructor(
    @Inject(ISSUE_TICKET_REPOSITORY)
    private readonly issueTicketRepository: IIssueTicketRepository,
  ) {}

  async execute(ticketId: number, lineId: number): Promise<void> {
    const ticket = await this.issueTicketRepository.findById(ticketId);
    if (!ticket) {
      throw new IssueTicketNotFoundException(ticketId);
    }

    if (ticket.status !== IssueTicketStatus.DRAFT) {
      throw new IssueTicketNotDraftException(ticketId);
    }

    const existingLine = await this.issueTicketRepository.findLineById(lineId);
    if (!existingLine || existingLine.ticketId !== ticketId) {
      throw new IssueTicketLineNotFoundException(lineId);
    }

    const newTotalAmount = ticket.totalAmount
      .minus(existingLine.lineTotal)
      .toDecimalPlaces(3);

    await this.issueTicketRepository.deleteLine(
      lineId,
      ticketId,
      newTotalAmount,
    );
  }
}

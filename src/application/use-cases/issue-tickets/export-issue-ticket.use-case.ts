import { Inject, Injectable } from "@nestjs/common";
import {
  ISSUE_TICKET_REPOSITORY,
  type IIssueTicketRepository,
} from "../../../domain/contracts/issue-ticket.repository.interface";
import { IssueTicketNotFoundException } from "../../../domain/exceptions/issue-ticket.exceptions";
import {
  type PaymentMethod,
  DEFAULT_PAYMENT_METHOD,
} from "../../../domain/constants/payment-method.constant";
import { ExcelExportService } from "../../../infrastructure/services/excel-export.service";

export interface ExportIssueTicketResult {
  buffer: Buffer;
  filename: string;
}

@Injectable()
export class ExportIssueTicketUseCase {
  constructor(
    @Inject(ISSUE_TICKET_REPOSITORY)
    private readonly issueTicketRepository: IIssueTicketRepository,
    private readonly excelExportService: ExcelExportService,
  ) {}

  async execute(
    id: number,
    paymentMethod?: PaymentMethod,
  ): Promise<ExportIssueTicketResult> {
    // findById now performs the enriched query (product + customer joins)
    const ticket = await this.issueTicketRepository.findById(id);
    if (!ticket) {
      throw new IssueTicketNotFoundException(id);
    }

    const effectivePaymentMethod = paymentMethod ?? DEFAULT_PAYMENT_METHOD;

    const buffer = await this.excelExportService.generateIssueTicketExport(
      ticket,
      effectivePaymentMethod,
    );

    const filename = this.excelExportService.buildIssueTicketFilename(
      ticket.code,
      ticket.createdAt,
    );

    return { buffer, filename };
  }
}

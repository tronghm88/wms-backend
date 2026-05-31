import { Inject, Injectable } from "@nestjs/common";
import {
  RECEIPT_TICKET_REPOSITORY,
  type IReceiptTicketRepository,
} from "../../../domain/contracts/receipt-ticket.repository.interface";
import { ReceiptTicketNotFoundException } from "../../../domain/exceptions/receipt-ticket.exceptions";
import { ExcelExportService } from "../../../infrastructure/services/excel-export.service";

export interface ExportReceiptTicketResult {
  buffer: Buffer;
  filename: string;
}

@Injectable()
export class ExportReceiptTicketUseCase {
  constructor(
    @Inject(RECEIPT_TICKET_REPOSITORY)
    private readonly receiptTicketRepository: IReceiptTicketRepository,
    private readonly excelExportService: ExcelExportService,
  ) {}

  async execute(id: number): Promise<ExportReceiptTicketResult> {
    const ticket = await this.receiptTicketRepository.findWithLines(id);
    if (!ticket) {
      throw new ReceiptTicketNotFoundException(id);
    }

    const buffer = await this.excelExportService.generateReceiptTicketExport(
      ticket,
      ticket.lines,
    );

    const filename = this.excelExportService.buildReceiptTicketFilename(
      ticket.ticketNo,
      ticket.createdAt,
    );

    return { buffer, filename };
  }
}

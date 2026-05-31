import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  SPLIT_TICKET_REPOSITORY,
  type ISplitTicketRepository,
} from "../../../domain/contracts/split-ticket.repository.interface";
import { ExcelExportService } from "../../../infrastructure/services/excel-export.service";

export interface ExportSplitTicketResult {
  buffer: Buffer;
  filename: string;
}

@Injectable()
export class ExportSplitTicketUseCase {
  constructor(
    @Inject(SPLIT_TICKET_REPOSITORY)
    private readonly splitTicketRepository: ISplitTicketRepository,
    private readonly excelExportService: ExcelExportService,
  ) {}

  async execute(id: number): Promise<ExportSplitTicketResult> {
    const ticket = await this.splitTicketRepository.findByIdForExport(id);
    if (!ticket) {
      throw new NotFoundException(`Split Ticket with ID ${id} not found`);
    }

    const buffer =
      await this.excelExportService.generateSplitTicketExport(ticket);

    const filename = this.excelExportService.buildSplitTicketFilename(
      ticket.ticketNo,
      ticket.createdAt,
    );

    return { buffer, filename };
  }
}

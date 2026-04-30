import { ApiProperty } from "@nestjs/swagger";
import { ReceiptTicketResponseDto } from "../receipt-ticket-response.dto";
import { ReceiptTicketEntity } from "../../../domain/entities/receipt-ticket.entity";

export class CancelReceiptTicketResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: ReceiptTicketResponseDto })
  data: ReceiptTicketResponseDto;

  @ApiProperty({
    type: [String],
    example: ["Negative stock for product P001: -5.000"],
  })
  warnings: string[];

  constructor(ticket: ReceiptTicketEntity, warnings: string[]) {
    this.success = true;
    this.data = new ReceiptTicketResponseDto(ticket);
    this.warnings = warnings;
  }
}

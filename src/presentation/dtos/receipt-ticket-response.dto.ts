import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TransactionStatus } from "../../domain/enums";
import { ReceiptTicketEntity } from "../../domain/entities/receipt-ticket.entity";

export class ReceiptTicketResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "PN-202604-1" })
  ticketNo: string;

  @ApiProperty({ example: "2026-04-09T10:00:00Z" })
  date: Date;

  @ApiProperty({ enum: TransactionStatus, example: TransactionStatus.DRAFT })
  status: TransactionStatus;

  @ApiProperty({ example: 1 })
  createdBy: number;

  @ApiPropertyOptional({ example: "Shipment from Vendor A" })
  note?: string;

  @ApiProperty({ example: "2026-04-09T10:00:00Z" })
  createdAt: Date;

  @ApiProperty({ example: "2026-04-09T10:00:00Z" })
  updatedAt: Date;

  constructor(entity: ReceiptTicketEntity) {
    this.id = entity.id;
    this.ticketNo = entity.ticketNo;
    this.date = entity.date;
    this.status = entity.status;
    this.createdBy = entity.createdBy;
    this.note = entity.note;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}

import { ApiProperty } from "@nestjs/swagger";
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

  @ApiProperty({ example: 1 })
  creatorId: number;

  @ApiProperty({ example: "Shipment from Vendor A", nullable: true })
  note: string | null;

  @ApiProperty({ example: "Supplier XYZ", nullable: true })
  supplierName: string | null;

  @ApiProperty({ example: "INV-12345", nullable: true })
  invoiceNo: string | null;

  @ApiProperty({ example: "2026-04-09T00:00:00Z", nullable: true })
  invoiceDate: Date | null;

  @ApiProperty({ example: "2026-04-09T10:00:00Z" })
  createdAt: Date;

  @ApiProperty({ example: "2026-04-09T10:00:00Z" })
  updatedAt: Date;

  @ApiProperty({ example: "Admin User" })
  createdByName: string;

  @ApiProperty({ example: 5 })
  totalLines: number;

  @ApiProperty({ example: null, nullable: true })
  totalQuantity: string | null;

  constructor(entity: ReceiptTicketEntity) {
    this.id = entity.id;
    this.ticketNo = entity.ticketNo;
    this.date = entity.date;
    this.status = entity.status;
    this.createdBy = entity.createdBy;
    this.creatorId = entity.createdBy;
    this.note = entity.note;
    this.supplierName = entity.supplierName;
    this.invoiceNo = entity.invoiceNo;
    this.invoiceDate = entity.invoiceDate;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
    this.createdByName = entity.createdByName || "";
    this.totalLines = entity.totalLines || 0;
    this.totalQuantity = entity.totalQuantity
      ? entity.totalQuantity.toString()
      : null;
  }
}

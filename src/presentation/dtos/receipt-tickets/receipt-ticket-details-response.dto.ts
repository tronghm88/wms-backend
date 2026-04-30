import { ApiProperty } from "@nestjs/swagger";
import { TransactionStatus } from "../../../domain/enums";
import { ReceiptTicketLineResponseDto } from "./receipt-ticket-line-response.dto";
import { GetReceiptTicketUseCaseOutput } from "../../../application/use-cases/receipt-tickets/get-receipt-ticket.use-case";

export class ReceiptTicketDetailsResponseDto {
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

  @ApiProperty({ example: "Admin User" })
  createdByName: string;

  @ApiProperty({ example: 5 })
  totalLines: number;

  @ApiProperty({ example: null, nullable: true })
  totalQuantity: string | null;

  @ApiProperty({ type: [ReceiptTicketLineResponseDto] })
  lines: ReceiptTicketLineResponseDto[];

  @ApiProperty({ example: "100.500" })
  totalM2: string;

  @ApiProperty({ example: "250.000" })
  totalKg: string;

  @ApiProperty({ example: "10.000" })
  totalRolls: string;

  @ApiProperty({ example: "2026-04-09T10:00:00Z" })
  createdAt: Date;

  @ApiProperty({ example: "2026-04-09T10:00:00Z" })
  updatedAt: Date;

  constructor(output: GetReceiptTicketUseCaseOutput) {
    this.id = output.id;
    this.ticketNo = output.ticketNo;
    this.date = output.date;
    this.status = output.status;
    this.createdBy = output.createdBy;
    this.creatorId = output.createdBy;
    this.note = output.note;
    this.supplierName = output.supplierName;
    this.invoiceNo = output.invoiceNo;
    this.invoiceDate = output.invoiceDate;
    this.createdByName = output.createdByName || "";
    this.totalLines = output.totalLines || 0;
    this.totalQuantity = output.totalQuantity
      ? output.totalQuantity.toString()
      : null;
    this.lines = output.lines.map(
      (line) => new ReceiptTicketLineResponseDto(line),
    );
    this.totalM2 = output.totalM2.toFixed(3);
    this.totalKg = output.totalKg.toFixed(3);
    this.totalRolls = output.totalRolls.toFixed(3);
    this.createdAt = output.createdAt;
    this.updatedAt = output.updatedAt;
  }
}

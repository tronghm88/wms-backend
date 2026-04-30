import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { StockMovementType } from "../../../domain/enums";
import type { MovementHistoryOutput } from "../../../application/use-cases/inventory/get-product-stock-detail.use-case";

export class RecentMovementItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ enum: StockMovementType, example: StockMovementType.IN })
  txType: StockMovementType;

  @ApiProperty({ example: 10 })
  referenceId: number;

  @ApiProperty({ example: "RECEIPT_TICKET" })
  referenceType: string;

  @ApiPropertyOptional({ example: "PN-0001" })
  ticketNo: string | null;

  @ApiProperty({
    example: "50.000",
    description: "Change in quantity (positive = in, negative = out).",
  })
  deltaQty: string;

  @ApiProperty({
    example: "150.000",
    description: "Running balance after this movement.",
  })
  qtyAfter: string;

  @ApiProperty({ example: 1 })
  performedBy: number;

  @ApiProperty({ example: "John Doe" })
  performerName: string;

  @ApiPropertyOptional({ example: "Initial receipt" })
  note: string | null;

  @ApiProperty({ example: "2026-04-30T12:00:00Z" })
  createdAt: Date;

  constructor(data: MovementHistoryOutput) {
    this.id = data.id;
    this.txType = data.txType;
    this.referenceId = data.referenceId;
    this.referenceType = data.referenceType;
    this.ticketNo = data.ticketNo;
    this.deltaQty = data.deltaQty;
    this.qtyAfter = data.qtyAfter;
    this.performedBy = data.performedBy;
    this.performerName = data.performerName;
    this.note = data.note;
    this.createdAt = data.createdAt;
  }
}

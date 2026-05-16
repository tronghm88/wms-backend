import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { StockMovementType } from "../../../domain/enums";
import { AuditLogResponse } from "../../../application/dtos/stock/audit-log-response.dto";

export class AuditLogResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  productId: number;

  @ApiProperty({ example: "PROD-001" })
  productCode: string;

  @ApiProperty({ example: "Polycarbonate Sheet" })
  productName: string;

  @ApiProperty({ example: 1 })
  categoryId: number;

  @ApiProperty({ example: "Sheets" })
  categoryName: string;

  @ApiProperty({ enum: StockMovementType })
  txType: StockMovementType;

  @ApiProperty({ example: 1 })
  referenceId: number;

  @ApiProperty({ example: "RECEIPT_TICKET" })
  referenceType: string;

  @ApiPropertyOptional({ example: "PN-0001" })
  ticketNo: string | null;

  @ApiProperty({ example: "10.000" })
  deltaQty: string;

  @ApiProperty({ example: "100.000" })
  qtyAfter: string;

  @ApiProperty({ example: 1 })
  performedBy: number;

  @ApiProperty({ example: "John Doe" })
  performerName: string;

  @ApiPropertyOptional({ example: "Initial stock" })
  note: string | null;

  @ApiPropertyOptional({ example: "50.000" })
  unitCost: string | null;

  @ApiProperty({ example: "2026-04-17T10:00:00Z" })
  createdAt: Date;

  constructor(data: AuditLogResponse) {
    this.id = data.id;
    this.productId = data.productId;
    this.productCode = data.productCode;
    this.productName = data.productName;
    this.categoryId = data.categoryId;
    this.categoryName = data.categoryName;
    this.txType = data.txType;
    this.referenceId = data.referenceId;
    this.referenceType = data.referenceType;
    this.ticketNo = data.ticketNo;
    this.deltaQty = data.deltaQty;
    this.qtyAfter = data.qtyAfter;
    this.performedBy = data.performedBy;
    this.performerName = data.performerName;
    this.unitCost = data.unitCost;
    this.note = data.note;
    this.createdAt = data.createdAt;
  }
}

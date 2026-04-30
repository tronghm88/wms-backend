import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ReceiptTicketLineEntity } from "../../../domain/entities/receipt-ticket-line.entity";

export class ReceiptTicketLineResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  ticketId: number;

  @ApiProperty({ example: 1 })
  productId: number;

  @ApiProperty({ example: "1.000" })
  quantity: string;

  @ApiProperty({ example: "roll" })
  unitCode: string;

  @ApiPropertyOptional({ example: "50.000" })
  lengthM?: string;

  @ApiPropertyOptional({ example: "75.000" })
  areaM2?: string;

  @ApiPropertyOptional({ example: "15.000" })
  weightKg?: string;

  @ApiPropertyOptional({ example: "Defect at the end of roll" })
  note?: string | null;

  @ApiPropertyOptional({ example: "Product A" })
  productName?: string;

  @ApiPropertyOptional({ example: "PROD-A" })
  productCode?: string;

  @ApiPropertyOptional({ example: "Roll" })
  unitLabel?: string;

  @ApiProperty({ example: "2026-04-09T10:00:00Z" })
  createdAt: Date;

  @ApiProperty({ example: "2026-04-09T10:00:00Z" })
  updatedAt: Date;

  constructor(entity: ReceiptTicketLineEntity) {
    this.id = entity.id;
    this.ticketId = entity.ticketId;
    this.productId = entity.productId;
    this.quantity = entity.quantity.toFixed(3);
    this.unitCode = entity.unitCode;
    this.lengthM = entity.lengthM?.toFixed(3);
    this.areaM2 = entity.areaM2?.toFixed(3);
    this.weightKg = entity.weightKg?.toFixed(3);
    this.note = entity.note;
    this.productName = entity.productName;
    this.productCode = entity.productCode;
    this.unitLabel = entity.unitLabel;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}

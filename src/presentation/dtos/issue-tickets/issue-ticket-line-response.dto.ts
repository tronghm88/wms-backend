import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DiscountType } from "../../../domain/enums";
import { IssueTicketLineEntity } from "../../../domain/entities/issue-ticket-line.entity";

export class IssueTicketLineResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  ticketId: number;

  @ApiProperty({ example: 1 })
  productId: number;

  @ApiProperty({ example: "10.500" })
  quantity: string;

  @ApiProperty({ example: "m" })
  unitCode: string;

  @ApiProperty({ example: "100.000" })
  basePrice: string;

  @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENT })
  discountType: DiscountType;

  @ApiProperty({ example: "5.000" })
  discountValue: string;

  @ApiProperty({ example: "95.000" })
  finalPrice: string;

  @ApiProperty({ example: "997.500" })
  lineTotal: string;

  @ApiPropertyOptional({ example: "100.000" })
  originalPrice?: string;

  @ApiProperty({ example: false })
  isOverride: boolean;

  @ApiPropertyOptional({ example: "Line note" })
  note?: string | null;

  @ApiProperty({ example: "2026-04-11T10:00:00Z" })
  createdAt: Date;

  @ApiProperty({ example: "2026-04-11T10:00:00Z" })
  updatedAt: Date;

  constructor(entity: IssueTicketLineEntity) {
    this.id = entity.id;
    this.ticketId = entity.ticketId;
    this.productId = entity.productId;
    this.quantity = entity.quantity.toFixed(3);
    this.unitCode = entity.unitCode;
    this.basePrice = entity.basePrice.toFixed(3);
    this.discountType = entity.discountType;
    this.discountValue = entity.discountValue.toFixed(3);
    this.finalPrice = entity.finalPrice.toFixed(3);
    this.lineTotal = entity.lineTotal.toFixed(3);
    this.originalPrice = entity.originalPrice?.toFixed(3);
    this.isOverride = entity.isOverride;
    this.note = entity.note;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}

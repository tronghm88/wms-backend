import { ApiProperty } from "@nestjs/swagger";
import { DiscountType } from "../../../domain/enums";

export class DiscountPolicyResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  customerId: number;

  @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENT })
  discountType: DiscountType;

  @ApiProperty({ example: true })
  isAppliedAll: boolean;

  @ApiProperty({ example: [1, 2] })
  productIds: number[];

  @ApiProperty({ example: "10.000", description: "Discount value as string" })
  discountValue: string;

  @ApiProperty({ example: "2026-03-30T10:00:00Z" })
  createdAt: Date;

  @ApiProperty({ example: "2026-03-30T10:00:00Z" })
  updatedAt: Date;
}

import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
} from "class-validator";
import { DiscountType } from "../../../domain/enums";

export class CreateDiscountPolicyDto {
  @ApiProperty({ example: 1, description: "The ID of the customer" })
  @IsNotEmpty()
  @IsInt()
  customerId: number;

  @ApiProperty({
    enum: DiscountType,
    example: DiscountType.PERCENT,
    description: "Type of discount",
  })
  @IsNotEmpty()
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({
    example: true,
    description: "Whether the discount applies to all products",
  })
  @IsNotEmpty()
  @IsBoolean()
  isAppliedAll: boolean;

  @ApiProperty({
    example: [1, 2],
    description: "List of product IDs if isAppliedAll is false",
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  productIds: number[] = [];

  @ApiProperty({
    example: "10.000",
    description: "Discount value (percentage or amount)",
  })
  @IsNotEmpty()
  @IsNumberString()
  discountValue: string;
}

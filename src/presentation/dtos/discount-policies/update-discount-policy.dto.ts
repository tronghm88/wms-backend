import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { DiscountType } from "../../../domain/enums";

export class UpdateDiscountPolicyDto {
  @ApiProperty({ example: "PERCENT" })
  @IsEnum(DiscountType)
  @IsNotEmpty()
  discountType: DiscountType;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  isAppliedAll: boolean;

  @ApiProperty({ example: [1, 2], required: false })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  productIds?: number[];

  @ApiProperty({ example: "10.000" })
  @IsString()
  @IsNotEmpty()
  discountValue: string;
}

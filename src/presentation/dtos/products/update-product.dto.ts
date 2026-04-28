import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class UpdateProductDto {
  @ApiPropertyOptional({
    example: "PROD001-NEW",
    description: "The unique manual code of the product",
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    example: "Steel Plate A1 Updated",
    description: "The name of the product",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 1,
    description: "The ID of the category",
  })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({
    example: "m2",
    description: "The base unit code of the product",
  })
  @IsOptional()
  @IsString()
  baseUnit?: string;

  @ApiPropertyOptional({
    example: "160.000",
    description: "The base price of the product (string for decimal precision)",
  })
  @IsOptional()
  @IsNumberString()
  basePrice?: string;

  @ApiPropertyOptional({
    example: "2.500",
    description: "The length of the product",
  })
  @IsOptional()
  @IsNumberString()
  length?: string;

  @ApiPropertyOptional({
    example: "1.200",
    description: "The width of the product",
  })
  @IsOptional()
  @IsNumberString()
  width?: string;

  @ApiPropertyOptional({
    example: "0.010",
    description: "The height of the product",
  })
  @IsOptional()
  @IsNumberString()
  height?: string;

  @ApiPropertyOptional({
    example: "This is a detailed description of the product.",
    description: "The description of the product",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: "ASTM A36",
    description: "The specification text of the product",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  specText?: string;

  @ApiPropertyOptional({
    example: "120.000",
    description: "The cost price of the product (string for decimal precision)",
  })
  @IsOptional()
  @IsNumberString()
  costPrice?: string;

  @ApiPropertyOptional({
    example: "10.000",
    description:
      "The reorder threshold quantity (string for decimal precision)",
  })
  @IsOptional()
  @IsNumberString()
  reorderThreshold?: string;

  @ApiPropertyOptional({
    example: 1,
    description: "The ID of the parent product (for split lineage)",
  })
  @IsOptional()
  @IsNumber()
  parentProductId?: number;
}

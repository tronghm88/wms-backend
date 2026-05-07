import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateProductDto {
  @ApiProperty({
    example: "PROD001",
    description: "The unique manual code of the product",
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    example: "Steel Plate A1",
    description: "The name of the product",
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 1,
    description: "The ID of the category",
  })
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @ApiProperty({
    example: "150.500",
    description: "The base price of the product (string for decimal precision)",
  })
  @IsNotEmpty()
  @IsNumberString()
  basePrice: string;

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
    default: "0",
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

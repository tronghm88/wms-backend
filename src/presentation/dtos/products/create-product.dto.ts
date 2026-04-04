import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
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
    example: "m2",
    description: "The base unit code of the product",
  })
  @IsNotEmpty()
  @IsString()
  baseUnit: string;

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
}

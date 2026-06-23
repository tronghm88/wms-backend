import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsBoolean,
  IsString,
  IsInt,
  Min,
  Max,
} from "class-validator";
import { Transform, Type } from "class-transformer";

export class GetProductsDto {
  @ApiPropertyOptional({
    description: "Filter products by keyword (matches code or name)",
    example: "PROD",
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description: "Filter products by category ID",
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;

  @ApiPropertyOptional({
    description: "Filter products by base unit code",
    example: "kg",
  })
  @IsOptional()
  @IsString()
  baseUnit?: string;

  @ApiPropertyOptional({
    description: "Filter products with stock <= reorderThreshold",
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true" || value === true)
  lowStock?: boolean;

  @ApiPropertyOptional({
    description: "Page number (1-indexed)",
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Number of items per page",
    example: 20,
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  limit?: number = 20;
}

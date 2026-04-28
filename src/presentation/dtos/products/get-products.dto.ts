import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsBoolean, IsString, IsInt } from "class-validator";
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
}

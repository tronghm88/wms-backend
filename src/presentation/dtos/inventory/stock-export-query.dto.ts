import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDateString, IsInt, IsOptional, Min } from "class-validator";

export class StockExportQueryDto {
  @ApiProperty({
    example: 1,
    description: "ID of the category to export stock report (required).",
  })
  @Type(() => Number)
  @IsInt()
  categoryId: number;

  @ApiPropertyOptional({
    example: "2026-04-01T00:00:00Z",
    description:
      "Start date of the reporting period (ISO 8601 UTC). Default: first day of current month.",
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: "2026-04-30T23:59:59Z",
    description:
      "End date of the reporting period (ISO 8601 UTC). Default: current time.",
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

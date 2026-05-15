import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsDateString } from "class-validator";

export class GetSplitStatsQueryDto {
  @ApiPropertyOptional({
    description:
      "Filter from date (ISO 8601). If omitted, defaults to start of today.",
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: "Filter to date (ISO 8601). If omitted, defaults to now.",
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}

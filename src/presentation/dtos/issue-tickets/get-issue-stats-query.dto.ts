import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional } from "class-validator";

export class GetIssueStatsQueryDto {
  @ApiPropertyOptional({
    description:
      "Filter from date (ISO 8601). Defaults to start of today if omitted.",
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: "Filter to date (ISO 8601). Defaults to now if omitted.",
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}

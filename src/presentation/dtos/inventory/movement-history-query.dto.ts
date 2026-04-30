import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from "class-validator";
import { Type } from "class-transformer";
import type { TicketTypeFilter } from "../../../domain/contracts/inventory.repository.interface";

export class MovementHistoryQueryDto {
  @ApiPropertyOptional({
    example: "2026-04-01T00:00:00Z",
    description: "Start of date range. Defaults to 30 days ago.",
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: "2026-04-30T23:59:59Z",
    description: "End of date range. Defaults to now.",
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    enum: ["receipt", "issue", "split"],
    description: "Filter by ticket type.",
  })
  @IsOptional()
  @IsEnum(["receipt", "issue", "split"] as const)
  ticketType?: TicketTypeFilter;

  @ApiPropertyOptional({
    example: 1,
    description: "Page number (1-indexed). Default: 1.",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 20,
    description: "Items per page. Default: 20.",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

export class MovementHistoryResponseDto {
  items: object[];
  total: number;
  page: number;
  limit: number;
}

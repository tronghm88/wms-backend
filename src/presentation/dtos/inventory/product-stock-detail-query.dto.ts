import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsOptional } from "class-validator";
import type { TicketTypeFilter } from "../../../domain/contracts/inventory.repository.interface";

export class ProductStockDetailQueryDto {
  @ApiPropertyOptional({
    example: "2026-04-01T00:00:00Z",
    description:
      "Start of date range. Defaults to the first day of the current month.",
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
    description: "Filter recent movements by ticket type.",
  })
  @IsOptional()
  @IsEnum(["receipt", "issue", "split"] as const)
  ticketType?: TicketTypeFilter;
}

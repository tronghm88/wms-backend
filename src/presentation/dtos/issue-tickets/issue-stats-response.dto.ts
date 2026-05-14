import { ApiProperty } from "@nestjs/swagger";
import { IIssueTicketStats } from "../../../domain/contracts/issue-ticket.repository.interface";

export class IssueStatsResponseDto {
  @ApiProperty({
    description: "Total number of issue tickets created in the range",
    example: 42,
  })
  totalCount: number;

  @ApiProperty({
    description: "Total number of product lines across all tickets in range",
    example: 105,
  })
  totalLines: number;

  @ApiProperty({
    description: "Number of tickets still in DRAFT (pending) status",
    example: 8,
  })
  pendingCount: number;

  @ApiProperty({
    description: "Total revenue from COMPLETED tickets in range",
    example: "125000.000",
  })
  totalRevenue: string;

  constructor(stats: IIssueTicketStats) {
    this.totalCount = stats.totalCount;
    this.totalLines = stats.totalLines;
    this.pendingCount = stats.pendingCount;
    this.totalRevenue = stats.totalRevenue;
  }
}

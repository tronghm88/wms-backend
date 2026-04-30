import { ApiProperty } from "@nestjs/swagger";

export class ReceiptStatsResponseDto {
  @ApiProperty({
    description: "Total number of receipt tickets created in range",
  })
  totalCount: number;

  @ApiProperty({
    description: "Total number of product lines included in tickets",
  })
  totalLines: number;

  @ApiProperty({ description: "Total number of pending tickets" })
  pendingCount: number;

  @ApiProperty({
    description: "Total inbound quantity (Brainstorming later)",
    example: "0",
  })
  totalInbound: string;

  constructor(partial: Partial<ReceiptStatsResponseDto>) {
    Object.assign(this, partial);
  }
}

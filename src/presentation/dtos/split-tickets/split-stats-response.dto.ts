import { ApiProperty } from "@nestjs/swagger";

export class SplitStatsResponseDto {
  @ApiProperty({
    description: "Total number of split tickets created in range",
  })
  totalCount: number;

  @ApiProperty({
    description: "Total number of target product lines included in tickets",
  })
  totalLines: number;

  @ApiProperty({ description: "Total number of pending (Draft) tickets" })
  pendingCount: number;

  @ApiProperty({
    description: "Total source quantity split (Confirmed tickets)",
    example: "0",
  })
  splitedProductCount: string;

  constructor(partial: Partial<SplitStatsResponseDto>) {
    Object.assign(this, partial);
  }
}

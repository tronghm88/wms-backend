import { ApiProperty } from "@nestjs/swagger";

export class ProductStatsDto {
  @ApiProperty({ description: "Total number of products", example: 150 })
  total: number;

  @ApiProperty({
    description:
      "Count of products with inventory at or below restock threshold",
    example: 12,
  })
  lowStock: number;

  @ApiProperty({
    description:
      "Count of distinct products with receipt tickets created today",
    example: 5,
  })
  receiptedToday: number;

  @ApiProperty({
    description: "Count of distinct products with issue tickets created today",
    example: 3,
  })
  issuedToday: number;
}

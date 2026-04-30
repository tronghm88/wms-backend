import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type { ProductStockDetailOutput } from "../../../application/use-cases/inventory/get-product-stock-detail.use-case";
import { ProductStockListItemDto } from "./product-stock-list-response.dto";
import { RecentMovementItemDto } from "./movement-history-item.dto";

export class ProductStockDetailDto extends ProductStockListItemDto {
  @ApiPropertyOptional({ example: "A durable polycarbonate sheet." })
  description: string | null;

  @ApiPropertyOptional({ example: "PC-UV-10MM" })
  specText: string | null;

  @ApiProperty({
    example: "250.000",
    description: "Base price per unit (as string).",
  })
  basePrice: string;

  @ApiPropertyOptional({
    example: "200.000",
    description: "Cost price per unit (as string).",
  })
  costPrice: string | null;

  @ApiProperty({
    example: "10.000",
    description: "Reorder threshold in base units (as string).",
  })
  reorderThreshold: string;

  @ApiProperty({
    type: [RecentMovementItemDto],
    description:
      "Recent in/out/split movements within the selected date range.",
  })
  recentMovements: RecentMovementItemDto[];

  constructor(data: ProductStockDetailOutput) {
    super(data);
    this.description = data.description;
    this.specText = data.specText;
    this.basePrice = data.basePrice;
    this.costPrice = data.costPrice;
    this.reorderThreshold = data.reorderThreshold;
    this.recentMovements = data.recentMovements.map(
      (m) => new RecentMovementItemDto(m),
    );
  }
}

import { ApiProperty } from "@nestjs/swagger";
import type { ProductStockListOutput } from "../../../application/use-cases/inventory/get-product-stock-list.use-case";
import { StockConversionItemDto } from "./stock-conversion-item.dto";

export class ProductStockListItemDto {
  @ApiProperty({ example: 1 })
  productId: number;

  @ApiProperty({ example: "PROD-001" })
  productCode: string;

  @ApiProperty({ example: "Polycarbonate Sheet" })
  productName: string;

  @ApiProperty({ example: 1 })
  categoryId: number;

  @ApiProperty({ example: "Sheets" })
  categoryName: string;

  @ApiProperty({ example: "m", description: "Base unit code." })
  baseUnit: string;

  @ApiProperty({ example: "Meter", description: "Base unit label." })
  baseUnitLabel: string;

  @ApiProperty({
    example: "0.000",
    description:
      "Stock quantity at the start of the filter period (base unit, as string).",
  })
  openingStockBase: string;

  @ApiProperty({
    example: "100.000",
    description:
      "Stock quantity at the end of the filter period (base unit, as string).",
  })
  closingStockBase: string;

  @ApiProperty({
    type: [StockConversionItemDto],
    description: "Stock in each configured conversion unit.",
  })
  conversions: StockConversionItemDto[];

  constructor(data: ProductStockListOutput) {
    this.productId = data.productId;
    this.productCode = data.productCode;
    this.productName = data.productName;
    this.categoryId = data.categoryId;
    this.categoryName = data.categoryName;
    this.baseUnit = data.baseUnit;
    this.baseUnitLabel = data.baseUnitLabel;
    this.openingStockBase = data.openingStockBase;
    this.closingStockBase = data.closingStockBase;
    this.conversions = data.conversions.map(
      (c) => new StockConversionItemDto(c),
    );
  }
}

export class ProductStockListResponseDto {
  @ApiProperty({ type: [ProductStockListItemDto] })
  items: ProductStockListItemDto[];

  @ApiProperty({ example: 250, description: "Total matching products." })
  total: number;

  @ApiProperty({ example: 1, description: "Current page." })
  page: number;

  @ApiProperty({ example: 20, description: "Items per page." })
  limit: number;
}

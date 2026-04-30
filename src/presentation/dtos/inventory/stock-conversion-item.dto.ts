import { ApiProperty } from "@nestjs/swagger";
import type { StockConversionOutput } from "../../../application/use-cases/inventory/get-product-stock-list.use-case";

export class StockConversionItemDto {
  @ApiProperty({ example: "m2", description: "Converted unit code." })
  toUnit: string;

  @ApiProperty({
    example: "Square Meter",
    description: "Converted unit label.",
  })
  toUnitLabel: string;

  @ApiProperty({
    example: "12.000",
    description: "Conversion factor: 1 base unit = factor converted units.",
  })
  factor: string;

  @ApiProperty({
    example: "0.000",
    description: "Opening stock in converted unit.",
  })
  openingStock: string;

  @ApiProperty({
    example: "120.000",
    description: "Closing stock in converted unit.",
  })
  closingStock: string;

  constructor(data: StockConversionOutput) {
    this.toUnit = data.toUnit;
    this.toUnitLabel = data.toUnitLabel;
    this.factor = data.factor;
    this.openingStock = data.openingStock;
    this.closingStock = data.closingStock;
  }
}

import { ApiProperty } from "@nestjs/swagger";

export class UnitConversionItemDto {
  @ApiProperty({ example: "kg", description: "Unit code" })
  unit: string;

  @ApiProperty({ example: "Kilogram", description: "Unit display label" })
  label: string;

  @ApiProperty({
    example: "50.000",
    description: "Conversion rate from base unit",
  })
  rate: string;
}

export class StockConversionItemDto {
  @ApiProperty({ example: "kg", description: "Unit code" })
  unit: string;

  @ApiProperty({ example: "Kilogram", description: "Unit display label" })
  label: string;

  @ApiProperty({
    example: "5000.000",
    description: "Stock quantity in this unit",
  })
  stock: string;
}

export class ProductDetailResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "PROD-001" })
  code: string;

  @ApiProperty({ example: "Example Product" })
  name: string;

  @ApiProperty({ example: 1 })
  categoryId: number;

  @ApiProperty({ example: "General Category" })
  categoryName: string;

  @ApiProperty({ example: "cuon", description: "Base unit code" })
  baseUnit: string;

  @ApiProperty({ example: "Cuộn", description: "Base unit display label" })
  baseUnitLabel: string;

  @ApiProperty({
    example: "100.000",
    description: "Base price formatted as string",
  })
  basePrice: string;

  @ApiProperty({ example: "1.500", nullable: true })
  length: string | null;

  @ApiProperty({ example: "2.000", nullable: true })
  width: string | null;

  @ApiProperty({ example: "0.500", nullable: true })
  height: string | null;

  @ApiProperty({
    example: "Detailed description",
    required: false,
    nullable: true,
  })
  description?: string;

  @ApiProperty({ example: "ASTM A36", required: false, nullable: true })
  specText?: string;

  @ApiProperty({ example: "120.000", required: false, nullable: true })
  costPrice?: string;

  @ApiProperty({ example: "10.000", required: true })
  reorderThreshold: string;

  @ApiProperty({ example: 1, required: false, nullable: true })
  parentProductId?: number;

  @ApiProperty({
    example: "100.000",
    description: "Current stock quantity in base unit",
  })
  stock: string;

  @ApiProperty({
    type: [UnitConversionItemDto],
    description: "Configured unit conversions for this product",
    example: [{ unit: "kg", label: "Kilogram", rate: "50.000" }],
  })
  unitConversions: UnitConversionItemDto[];

  @ApiProperty({
    type: [StockConversionItemDto],
    description: "Stock quantity expressed in each configured conversion unit",
    example: [{ unit: "kg", label: "Kilogram", stock: "5000.000" }],
  })
  stockConversions: StockConversionItemDto[];

  @ApiProperty({ example: "2026-03-30T10:00:00Z" })
  createdAt: Date;

  @ApiProperty({ example: "2026-03-30T10:00:00Z" })
  updatedAt: Date;
}

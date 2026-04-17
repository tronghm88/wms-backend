import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { InventorySnapshotResponse } from "../../../application/use-cases/inventory/get-inventory-snapshot.use-case";

export class InventorySnapshotResponseDto {
  @ApiProperty({ example: 1 })
  productId: number;

  @ApiProperty({ example: "PROD-001" })
  productCode: string;

  @ApiProperty({ example: "Polycarbonate Sheet" })
  productName: string;

  @ApiProperty({ example: "Sheets" })
  categoryName: string;

  @ApiProperty({ example: "100.000" })
  quantity: string;

  @ApiProperty({ example: "m2" })
  unitCode: string;

  @ApiPropertyOptional({ example: "12.000" })
  length?: string;

  @ApiPropertyOptional({ example: "2.400" })
  width?: string;

  @ApiPropertyOptional({ example: "0.010" })
  height?: string;

  @ApiPropertyOptional({ example: "150.000" })
  weight?: string;

  @ApiProperty({ example: "2026-04-09T10:00:00Z" })
  lastUpdated: Date;

  constructor(data: InventorySnapshotResponse) {
    this.productId = data.productId;
    this.productCode = data.productCode;
    this.productName = data.productName;
    this.categoryName = data.categoryName;
    this.quantity = data.quantity;
    this.unitCode = data.unitCode;
    this.length = data.length;
    this.width = data.width;
    this.height = data.height;
    this.weight = data.weight;
    this.lastUpdated = data.lastUpdated;
  }
}

import { ApiProperty } from "@nestjs/swagger";

export class CategoryUnitItemDto {
  @ApiProperty({ example: "BOX" })
  unitCode: string;

  @ApiProperty({ example: "Box" })
  label: string;
}

export class CategoryDetailResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "ELECTRONICS" })
  code: string;

  @ApiProperty({ example: "Electronics" })
  name: string;

  @ApiProperty({ example: "PCS", nullable: true })
  baseUnit: string | null;

  @ApiProperty({ example: "Pieces", nullable: true })
  baseUnitLabel: string | null;

  @ApiProperty({ type: [CategoryUnitItemDto] })
  additionalUnits: CategoryUnitItemDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

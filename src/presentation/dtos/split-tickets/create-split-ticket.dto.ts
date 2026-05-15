import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { AddSplitTicketLineDto } from "./add-split-ticket-lines.dto";

export class CreateSplitTicketDto {
  @ApiProperty({ example: 1, description: "Source product ID" })
  @IsInt()
  sourceProductId: number;

  @ApiProperty({
    example: 1,
    description: "Warehouse ID (validated but currently single-warehouse)",
  })
  @IsInt()
  warehouseId: number;

  @ApiProperty({
    example: 100,
    description: "Quantity of source product to split",
  })
  @IsNumber()
  @Min(0.001)
  sourceQty: number;

  @ApiProperty({ example: "m2", description: "Unit code of source product" })
  @IsString()
  sourceUnitCode: string;

  @ApiProperty({
    example: "Splitting roll for custom order",
    description: "Optional note",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiProperty({
    type: [AddSplitTicketLineDto],
    description: "List of child lines to add",
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AddSplitTicketLineDto)
  lines?: AddSplitTicketLineDto[];
}

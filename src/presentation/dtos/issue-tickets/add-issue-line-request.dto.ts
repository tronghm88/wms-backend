import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export class AddIssueLineRequestDto {
  @ApiProperty({ example: 1, description: "Product ID" })
  @IsInt()
  productId: number;

  @ApiProperty({ example: 10.5, description: "Quantity" })
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiProperty({ example: "m", description: "Unit code" })
  @IsString()
  unitCode: string;

  @ApiPropertyOptional({
    example: 95.5,
    description: "Manual price override (requires price override permission)",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  manualPrice?: number;

  @ApiPropertyOptional({ example: "Line note", description: "Optional note" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

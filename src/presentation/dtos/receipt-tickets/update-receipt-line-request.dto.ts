import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";

export class UpdateReceiptLineRequestDto {
  @ApiPropertyOptional({
    example: 1,
    description: "The ID of the product",
  })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({
    example: "1",
    description: "The quantity (e.g., number of rolls)",
  })
  @IsOptional()
  @IsNumberString()
  quantity?: string;

  @ApiPropertyOptional({
    example: "roll",
    description: "The unit code (e.g., roll, bundle)",
  })
  @IsOptional()
  @IsString()
  unitCode?: string;

  @ApiPropertyOptional({
    example: "150.500",
    description: "The cost per unit paid to buy/import",
  })
  @IsOptional()
  @IsNumberString()
  unitCost?: string;

  @ApiPropertyOptional({
    example: "Updated line note",
    description: "Line item note",
  })
  @IsOptional()
  @IsString()
  note?: string;
}

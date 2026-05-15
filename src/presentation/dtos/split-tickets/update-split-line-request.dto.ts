import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class UpdateSplitLineRequestDto {
  @ApiPropertyOptional({ example: 1, description: "Target product ID" })
  @IsOptional()
  @IsNumber()
  targetProductId?: number;

  @ApiPropertyOptional({
    example: 10.5,
    description: "Quantity of the child line",
  })
  @IsOptional()
  @IsNumber()
  @Min(0.001)
  quantity?: number;

  @ApiPropertyOptional({
    example: "m2",
    description: "Unit code for the child line",
  })
  @IsOptional()
  @IsString()
  unitCode?: string;

  @ApiPropertyOptional({
    example: false,
    description: "Whether this is a newly created product from split",
  })
  @IsOptional()
  @IsBoolean()
  isNewProduct?: boolean;

  @ApiPropertyOptional({
    example: "Updated line note",
    description: "Optional note for the line item",
  })
  @IsOptional()
  @IsString()
  note?: string;
}

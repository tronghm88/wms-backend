import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";

export class AddReceiptLineRequestDto {
  @ApiProperty({
    example: 1,
    description: "The ID of the product",
  })
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty({
    example: "1",
    description: "The quantity (e.g., number of rolls)",
  })
  @IsNotEmpty()
  @IsNumberString()
  quantity: string;

  @ApiProperty({
    example: "roll",
    description: "The unit code (e.g., roll, bundle)",
  })
  @IsNotEmpty()
  @IsString()
  unitCode: string;

  @ApiPropertyOptional({
    example: "50.000",
    description: "The length of the roll in meters",
  })
  @IsOptional()
  @IsNumberString()
  lengthM?: string;

  @ApiPropertyOptional({
    example: "Defect at the end of roll",
    description: "Line item note",
  })
  @IsOptional()
  @IsString()
  note?: string;
}

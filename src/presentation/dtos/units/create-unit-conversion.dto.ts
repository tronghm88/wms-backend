import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateUnitConversionDto {
  @ApiProperty({
    example: 1,
    description: "The product ID",
  })
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty({
    example: "box",
    description: "Source unit code",
  })
  @IsNotEmpty()
  @IsString()
  fromUnit: string;

  @ApiProperty({
    example: "pcs",
    description: "Target unit code",
  })
  @IsNotEmpty()
  @IsString()
  toUnit: string;

  @ApiProperty({
    example: "24",
    description: "Conversion factor as a string",
  })
  @IsNotEmpty()
  @IsString()
  factor: string;
}

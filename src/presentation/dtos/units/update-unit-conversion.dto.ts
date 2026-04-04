import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateUnitConversionDto {
  @ApiProperty({
    example: "24",
    description: "Conversion factor as a string",
    required: false,
  })
  @IsOptional()
  @IsString()
  factor?: string;
}

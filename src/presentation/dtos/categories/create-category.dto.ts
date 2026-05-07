import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCategoryDto {
  @ApiProperty({
    example: "ELECTRONICS",
    description: "The unique manual code of the category",
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    example: "Electronics and Gadgets",
    description: "The name of the category",
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: "PCS",
    description: "The base unit for all products in this category",
  })
  @IsNotEmpty()
  @IsString()
  baseUnit: string;

  @ApiPropertyOptional({
    example: ["BOX", "CARTON"],
    description: "Additional units allowed for conversion in this category",
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  additionalUnits?: string[];
}

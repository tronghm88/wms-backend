import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

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
}

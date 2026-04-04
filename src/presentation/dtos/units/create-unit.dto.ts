import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateUnitDto {
  @ApiProperty({
    example: "kg",
    description: "The unique code of the unit",
  })
  @IsNotEmpty()
  @IsString()
  code: string;
}

import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    example: "ELECTRONICS_UPDATED",
    description: "The unique manual code of the category",
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    example: "Updated Category Name",
    description: "The name of the category",
  })
  @IsOptional()
  @IsString()
  name?: string;
}

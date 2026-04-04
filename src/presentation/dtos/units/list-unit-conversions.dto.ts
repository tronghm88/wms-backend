import { IsOptional, IsInt } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class ListUnitConversionsDto {
  @ApiPropertyOptional({
    description: "Filter by product ID",
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  productId?: number;
}

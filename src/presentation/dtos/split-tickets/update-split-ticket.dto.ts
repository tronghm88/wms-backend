import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, IsDateString } from "class-validator";

export class UpdateSplitTicketDto {
  @ApiProperty({
    example: "Updated note for split ticket",
    description: "Optional note",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiProperty({
    example: "2024-05-15T09:24:23Z",
    description: "Transaction date",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}

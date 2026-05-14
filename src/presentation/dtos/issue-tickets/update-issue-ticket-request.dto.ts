import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateIssueTicketRequestDto {
  @ApiPropertyOptional({
    example: "Updated note",
    description: "Optional note for the ticket",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiPropertyOptional({
    example: "2026-05-01T00:00:00Z",
    description: "Issue date (ISO 8601)",
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}

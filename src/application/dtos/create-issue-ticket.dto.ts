import { IsInt, IsOptional, IsString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateIssueTicketDto {
  @ApiProperty({ example: 1, description: "Customer ID" })
  @IsInt()
  customerId: number;

  @ApiProperty({
    example: "Monthly supply",
    description: "Optional note",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

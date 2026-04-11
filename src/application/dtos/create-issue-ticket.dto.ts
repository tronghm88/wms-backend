import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateIssueTicketLineDto {
  @ApiProperty({ example: 1, description: "Product ID" })
  @IsInt()
  productId: number;

  @ApiProperty({ example: 10.5, description: "Quantity" })
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiProperty({ example: "m", description: "Unit code" })
  @IsString()
  unitCode: string;

  @ApiProperty({
    example: 95.5,
    description: "Manual price override (optional, requires Admin permission)",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  manualPrice?: number;
}

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

  @ApiProperty({
    type: [CreateIssueTicketLineDto],
    description: "Ticket lines",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIssueTicketLineDto)
  lines: CreateIssueTicketLineDto[];
}

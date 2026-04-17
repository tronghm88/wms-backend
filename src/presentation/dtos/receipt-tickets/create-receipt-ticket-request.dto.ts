import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsNotEmpty,
} from "class-validator";
import { Type } from "class-transformer";
import { AddReceiptLineRequestDto } from "./add-receipt-line-request.dto";

export class CreateReceiptTicketRequestDto {
  @ApiPropertyOptional({
    description: "Optional notes for the receipt ticket",
    example: "Shipment from Vendor A",
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    type: [AddReceiptLineRequestDto],
    description: "List of lines to add (must have at least one)",
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AddReceiptLineRequestDto)
  lines: AddReceiptLineRequestDto[];
}

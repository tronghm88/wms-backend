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

  @ApiPropertyOptional({
    description: "Supplier name",
    example: "Supplier XYZ",
  })
  @IsOptional()
  @IsString()
  supplierName?: string;

  @ApiPropertyOptional({
    description: "Invoice number",
    example: "INV-12345",
  })
  @IsOptional()
  @IsString()
  invoiceNo?: string;

  @ApiPropertyOptional({
    description: "Invoice date",
    example: "2026-04-09",
  })
  @IsOptional()
  @Type(() => Date)
  invoiceDate?: Date;

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

import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class UpdateReceiptTicketRequestDto {
  @ApiPropertyOptional({
    description: "Optional notes for the receipt ticket",
    example: "Updated shipment notes",
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
    example: "2026-04-09T00:00:00Z",
  })
  @IsOptional()
  @Type(() => Date)
  invoiceDate?: Date;
}

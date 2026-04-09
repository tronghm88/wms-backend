import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateReceiptTicketDto {
  @ApiPropertyOptional({
    description: "Optional notes for the receipt ticket",
    example: "Shipment from Vendor A",
  })
  @IsOptional()
  @IsString()
  note?: string;
}

import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateCustomerDto {
  @ApiPropertyOptional({
    example: "CUST001",
    description: "The unique manual code of the customer",
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    example: "ABC Corp",
    description: "The name of the customer",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: "123 Main St, City",
    description: "The address of the customer",
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: "0123456789",
    description: "The phone number of the customer",
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: "contact@abc.com",
    description: "The email of the customer",
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: "VIP Customer",
    description: "Optional notes about the customer",
  })
  @IsOptional()
  @IsString()
  note?: string;
}

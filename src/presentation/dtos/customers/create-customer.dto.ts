import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCustomerDto {
  @ApiProperty({
    example: "CUST001",
    description: "The unique manual code of the customer",
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    example: "ABC Corp",
    description: "The name of the customer",
  })
  @IsNotEmpty()
  @IsString()
  name: string;

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

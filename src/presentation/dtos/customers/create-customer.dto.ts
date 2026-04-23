import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
} from "class-validator";
import { CustomerType } from "../../../domain/enums";

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
    enum: CustomerType,
    example: CustomerType.ENTERPRISE,
    description: "The type of the customer",
  })
  @IsOptional()
  @IsEnum(CustomerType)
  type?: CustomerType;

  @ApiPropertyOptional({
    example: "ABC Corp",
    description: "The company name of the customer",
  })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({
    example: "TAX12345",
    description: "The tax code of the customer",
  })
  @IsOptional()
  @IsString()
  taxCode?: string;

  @ApiPropertyOptional({
    example: "John Doe",
    description: "The contact person of the customer",
  })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiPropertyOptional({
    example: "Billing Addr 1",
    description: "The billing address of the customer",
  })
  @IsOptional()
  @IsString()
  billingAddress?: string;

  @ApiPropertyOptional({
    example: "Shipping Addr 1",
    description: "The shipping address of the customer",
  })
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @ApiPropertyOptional({
    example: 1,
    description: "The ID of the staff assigned to this customer",
  })
  @IsOptional()
  @IsInt()
  assignedStaffId?: number;

  @ApiPropertyOptional({
    example: "VIP Customer",
    description: "Optional notes about the customer",
  })
  @IsOptional()
  @IsString()
  note?: string;
}

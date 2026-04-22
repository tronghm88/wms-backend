import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsArray,
  Matches,
  MaxLength,
} from "class-validator";
import { UserRole } from "../../../domain/enums";

export class CreateUserDto {
  @ApiProperty({ example: "staff@warehouse.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: "john123",
    description:
      "Unique username: 2–50 characters, alphanumeric, must start with a letter.",
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[a-zA-Z][a-zA-Z0-9]*$/, {
    message:
      "username must start with a letter and contain only letters and digits",
  })
  username!: string;

  @ApiProperty({ example: "StrongPass123!", minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: "John Doe" })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiPropertyOptional({
    example: "0901234567",
    description: "Phone number: digits only, up to 20 characters.",
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^\d+$/, { message: "phone must contain digits only" })
  phone?: string;

  @ApiPropertyOptional({ example: "Important user note" })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.WAREHOUSE_STAFF,
    description: "Note: SUPER_ADMIN role cannot be assigned through this API.",
  })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiPropertyOptional({
    type: [String],
    example: ["receipts:create", "issues:create"],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  customPermissions?: string[];
}

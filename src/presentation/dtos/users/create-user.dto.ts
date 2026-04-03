import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsArray,
} from "class-validator";
import { UserRole } from "../../../domain/entities/user.entity";

export class CreateUserDto {
  @ApiProperty({ example: "staff@warehouse.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "StrongPass123!", minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: "John Doe" })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

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

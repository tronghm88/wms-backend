import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";
import { UserRole } from "../../../domain/enums";

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: "johnny456",
    description:
      "Unique username: 2–50 characters, alphanumeric, must start with a letter.",
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^[a-zA-Z][a-zA-Z0-9]*$/, {
    message:
      "username must start with a letter and contain only letters and digits",
  })
  username?: string;

  @ApiPropertyOptional({ example: "John Doe Updated" })
  @IsString()
  @IsOptional()
  fullName?: string;

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

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.ADMIN,
    description: "Note: Cannot change to SUPER_ADMIN role.",
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({
    type: [String],
    example: ["receipts:create"],
    description:
      "NULL to use role permissions, empty or populated list for override.",
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  customPermissions?: string[];
}

import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsEnum, IsOptional, IsString } from "class-validator";
import { UserRole, UserStatus } from "../../../domain/entities/user.entity";

export class UpdateUserDto {
  @ApiPropertyOptional({ example: "John Doe Updated" })
  @IsString()
  @IsOptional()
  fullName?: string;

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

  @ApiPropertyOptional({ enum: UserStatus, example: UserStatus.INACTIVE })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}

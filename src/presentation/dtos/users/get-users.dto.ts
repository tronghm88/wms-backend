import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";
import { UserRole } from "../../../domain/enums";

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export enum UserSortBy {
  CREATED_AT = "createdAt",
  EMAIL = "email",
  FULL_NAME = "fullName",
}

export class GetUsersDto {
  @ApiPropertyOptional({ description: "Search by email or full name" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: UserRole, description: "Filter by role" })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ enum: UserSortBy, default: UserSortBy.CREATED_AT })
  @IsOptional()
  @IsEnum(UserSortBy)
  sortBy: UserSortBy = UserSortBy.CREATED_AT;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

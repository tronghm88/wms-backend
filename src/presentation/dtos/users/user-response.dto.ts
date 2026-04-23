import { ApiProperty } from "@nestjs/swagger";
import { UserRole, UserStatus } from "../../../domain/enums";

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "user@example.com" })
  email!: string;

  @ApiProperty({ example: "username123" })
  username!: string;

  @ApiProperty({ example: "John Doe" })
  fullName!: string;

  @ApiProperty({ example: "0901234567", nullable: true })
  phone!: string | null;

  @ApiProperty({ example: "Important user note", nullable: true })
  note!: string | null;

  @ApiProperty({ enum: UserRole, example: UserRole.WAREHOUSE_STAFF })
  role!: UserRole;

  @ApiProperty({
    type: [String],
    example: ["receipts:create"],
    nullable: true,
  })
  customPermissions!: string[] | null;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  status!: UserStatus;

  @ApiProperty({ example: "2026-03-30T10:00:00Z", nullable: true })
  lastLoginAt!: Date | null;

  @ApiProperty({ example: "2026-03-30T10:00:00Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2026-03-30T10:00:00Z" })
  updatedAt!: Date;
}

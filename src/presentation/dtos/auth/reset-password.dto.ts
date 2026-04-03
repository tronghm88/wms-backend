import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { Match } from "../validators/match.decorator";

export class ResetPasswordDto {
  @ApiProperty({ example: "oldpassword123", description: "Current password" })
  @IsNotEmpty()
  @IsString()
  oldPassword!: string;

  @ApiProperty({
    example: "newpassword123",
    description: "New password (min 8 chars)",
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword!: string;

  @ApiProperty({
    example: "newpassword123",
    description: "Confirm new password (must match newPassword)",
  })
  @IsNotEmpty()
  @IsString()
  @Match("newPassword")
  confirmPassword!: string;
}

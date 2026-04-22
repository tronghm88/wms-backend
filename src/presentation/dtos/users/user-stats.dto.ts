import { ApiProperty } from "@nestjs/swagger";

export class UserStatsDto {
  @ApiProperty({ description: "Total number of users", example: 100 })
  totalUsers: number;

  @ApiProperty({ description: "Number of active users", example: 80 })
  activeUsers: number;

  @ApiProperty({ description: "Number of inactive users", example: 20 })
  inactiveUsers: number;

  @ApiProperty({ description: "Number of admin users", example: 5 })
  adminCount: number;

  @ApiProperty({ description: "Number of staff users", example: 95 })
  staffCount: number;
}

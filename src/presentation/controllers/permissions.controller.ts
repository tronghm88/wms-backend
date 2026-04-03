import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import {
  Permissions,
  RolePermissions,
} from "../../domain/constants/permissions.constant";

@ApiTags("Permissions")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("v1/permissions")
export class PermissionsController {
  @Get()
  @ApiOperation({
    summary: "Get all available permissions and staff role permissions",
  })
  @ApiResponse({
    status: 200,
    description: "List of permissions retrieved successfully",
  })
  getPermissions() {
    return {
      allPermissions: Object.values(Permissions),
      staffPermissions: RolePermissions.WAREHOUSE_STAFF,
    };
  }
}

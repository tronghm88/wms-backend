import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CreateUnitUseCase } from "../../application/use-cases/units/create-unit.use-case";
import { CreateUnitDto } from "../dtos/units/create-unit.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RbacGuard, RequirePermissions } from "../guards/rbac.guard";
import { Permissions } from "../../domain/constants/permissions.constant";

@ApiTags("Units")
@Controller("api/v1/units")
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class UnitsController {
  constructor(private readonly createUnitUseCase: CreateUnitUseCase) {}

  @Post()
  @RequirePermissions(Permissions.UNITS_MANAGE)
  @ApiOperation({ summary: "Create a new unit" })
  @ApiResponse({
    status: 201,
    description: "The unit has been successfully created.",
  })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async create(@Body() createUnitDto: CreateUnitDto) {
    return await this.createUnitUseCase.execute(createUnitDto);
  }
}

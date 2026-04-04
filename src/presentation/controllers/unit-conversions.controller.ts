import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CreateUnitConversionUseCase } from "../../application/use-cases/units/create-unit-conversion.use-case";
import { CreateUnitConversionDto } from "../dtos/units/create-unit-conversion.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RbacGuard, RequirePermissions } from "../guards/rbac.guard";
import { Permissions } from "../../domain/constants/permissions.constant";

@ApiTags("Unit Conversions")
@Controller("api/v1/unit-conversions")
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class UnitConversionsController {
  constructor(
    private readonly createUnitConversionUseCase: CreateUnitConversionUseCase,
  ) {}

  @Post()
  @RequirePermissions(Permissions.UNITS_MANAGE)
  @ApiOperation({ summary: "Create a new unit conversion" })
  @ApiResponse({
    status: 201,
    description: "The unit conversion has been successfully created.",
  })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Product or Unit Not Found" })
  @ApiResponse({
    status: 409,
    description: "Conflict - Conversion already exists",
  })
  async create(@Body() createUnitConversionDto: CreateUnitConversionDto) {
    return await this.createUnitConversionUseCase.execute(
      createUnitConversionDto,
    );
  }
}

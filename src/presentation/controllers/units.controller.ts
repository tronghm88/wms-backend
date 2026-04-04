import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CreateUnitUseCase } from "../../application/use-cases/units/create-unit.use-case";
import { GetUnitsUseCase } from "../../application/use-cases/units/get-units.use-case";
import { GetUnitByCodeUseCase } from "../../application/use-cases/units/get-unit-by-code.use-case";
import { DeleteUnitUseCase } from "../../application/use-cases/units/delete-unit.use-case";
import { CreateUnitDto } from "../dtos/units/create-unit.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RbacGuard, RequirePermissions } from "../guards/rbac.guard";
import { Permissions } from "../../domain/constants/permissions.constant";

@ApiTags("Units")
@Controller("v1/units")
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class UnitsController {
  constructor(
    private readonly createUnitUseCase: CreateUnitUseCase,
    private readonly getUnitsUseCase: GetUnitsUseCase,
    private readonly getUnitByCodeUseCase: GetUnitByCodeUseCase,
    private readonly deleteUnitUseCase: DeleteUnitUseCase,
  ) {}

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

  @Get()
  @RequirePermissions(Permissions.UNITS_MANAGE)
  @ApiOperation({ summary: "List all units" })
  @ApiResponse({
    status: 200,
    description: "Returns an array of all available units.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findAll() {
    return await this.getUnitsUseCase.execute();
  }

  @Get(":code")
  @RequirePermissions(Permissions.UNITS_MANAGE)
  @ApiOperation({ summary: "Get a unit by code" })
  @ApiResponse({
    status: 200,
    description: "Returns the unit with the specified code.",
  })
  @ApiResponse({ status: 404, description: "Unit not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findOne(@Param("code") code: string) {
    return await this.getUnitByCodeUseCase.execute(code);
  }

  @Delete(":code")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permissions.UNITS_MANAGE)
  @ApiOperation({ summary: "Delete a unit by code" })
  @ApiResponse({
    status: 204,
    description: "The unit has been successfully deleted.",
  })
  @ApiResponse({ status: 404, description: "Unit not found" })
  @ApiResponse({
    status: 400,
    description: "Unit is in use and cannot be deleted",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async remove(@Param("code") code: string) {
    await this.deleteUnitUseCase.execute(code);
  }
}

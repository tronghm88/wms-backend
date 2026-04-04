import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CreateUnitConversionUseCase } from "../../application/use-cases/units/create-unit-conversion.use-case";
import { UpdateUnitConversionUseCase } from "../../application/use-cases/units/update-unit-conversion.use-case";
import { ListUnitConversionsUseCase } from "../../application/use-cases/units/list-unit-conversions.use-case";
import { CreateUnitConversionDto } from "../dtos/units/create-unit-conversion.dto";
import { UpdateUnitConversionDto } from "../dtos/units/update-unit-conversion.dto";
import { ListUnitConversionsDto } from "../dtos/units/list-unit-conversions.dto";
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
    private readonly updateUnitConversionUseCase: UpdateUnitConversionUseCase,
    private readonly listUnitConversionsUseCase: ListUnitConversionsUseCase,
  ) {}

  @Get()
  @RequirePermissions(Permissions.UNITS_VIEW)
  @ApiOperation({ summary: "List all unit conversions" })
  @ApiResponse({
    status: 200,
    description: "List of unit conversions.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findAll(@Query() query: ListUnitConversionsDto) {
    return await this.listUnitConversionsUseCase.execute(query);
  }

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

  @Patch(":id")
  @RequirePermissions(Permissions.UNITS_MANAGE)
  @ApiOperation({ summary: "Update an existing unit conversion" })
  @ApiResponse({
    status: 200,
    description: "The unit conversion has been successfully updated.",
  })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Unit conversion Not Found" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUnitConversionDto: UpdateUnitConversionDto,
  ) {
    const result = await this.updateUnitConversionUseCase.execute({
      id,
      ...updateUnitConversionDto,
    });

    return {
      ...result,
      factor: result.factor.toFixed(3),
    };
  }
}

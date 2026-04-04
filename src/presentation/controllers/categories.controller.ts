import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CreateCategoryUseCase } from "../../application/use-cases/categories/create-category.use-case";
import { UpdateCategoryUseCase } from "../../application/use-cases/categories/update-category.use-case";
import { GetCategoriesUseCase } from "../../application/use-cases/categories/get-categories.use-case";
import { CreateCategoryDto } from "../dtos/categories/create-category.dto";
import { UpdateCategoryDto } from "../dtos/categories/update-category.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RbacGuard, RequirePermissions } from "../guards/rbac.guard";
import { Permissions } from "../../domain/constants/permissions.constant";

@ApiTags("Categories")
@Controller("api/v1/categories")
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
  ) {}

  @Post()
  @RequirePermissions(Permissions.CATEGORIES_MANAGE)
  @ApiOperation({ summary: "Create a new product category" })
  @ApiResponse({
    status: 201,
    description: "The category has been successfully created.",
  })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 409, description: "Conflict - Code already exists" })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.createCategoryUseCase.execute(createCategoryDto);
  }

  @Patch(":id")
  @RequirePermissions(Permissions.CATEGORIES_MANAGE)
  @ApiOperation({ summary: "Update an existing product category" })
  @ApiResponse({
    status: 200,
    description: "The category has been successfully updated.",
  })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 409, description: "Conflict - Code already exists" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.updateCategoryUseCase.execute({
      id,
      ...updateCategoryDto,
    });
  }

  @Get()
  @RequirePermissions(Permissions.CATEGORIES_MANAGE)
  @ApiOperation({ summary: "List all product categories" })
  @ApiResponse({
    status: 200,
    description: "Returns an array of all available product categories.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findAll() {
    return await this.getCategoriesUseCase.execute();
  }
}

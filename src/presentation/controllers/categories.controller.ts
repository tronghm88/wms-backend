import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
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
import { GetCategoryByIdUseCase } from "../../application/use-cases/categories/get-category-by-id.use-case";
import { DeleteCategoryUseCase } from "../../application/use-cases/categories/delete-category.use-case";
import { CreateCategoryDto } from "../dtos/categories/create-category.dto";
import { UpdateCategoryDto } from "../dtos/categories/update-category.dto";
import { CategoryDetailResponseDto } from "../dtos/categories/category-detail-response.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RbacGuard, RequirePermissions } from "../guards/rbac.guard";
import { Permissions } from "../../domain/constants/permissions.constant";

@ApiTags("Categories")
@Controller("v1/categories")
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly getCategoryByIdUseCase: GetCategoryByIdUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
  ) {}

  @Post()
  @RequirePermissions(Permissions.CATEGORIES_CREATE)
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
  @RequirePermissions(Permissions.CATEGORIES_UPDATE)
  @ApiOperation({ summary: "Update an existing product category" })
  @ApiResponse({
    status: 200,
    description: "The category has been successfully updated.",
  })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({
    status: 409,
    description:
      "Conflict - Code already exists or base unit change blocked by confirmed transactions",
  })
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
  @RequirePermissions(Permissions.CATEGORIES_VIEW)
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

  @Get(":id")
  @RequirePermissions(Permissions.CATEGORIES_VIEW)
  @ApiOperation({ summary: "Get a product category by ID" })
  @ApiResponse({
    status: 200,
    description: "Returns the category object.",
    type: CategoryDetailResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Not Found" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return await this.getCategoryByIdUseCase.execute(id);
  }

  @Delete(":id")
  @HttpCode(200)
  @RequirePermissions(Permissions.CATEGORIES_DELETE)
  @ApiOperation({ summary: "Delete a product category" })
  @ApiResponse({
    status: 200,
    description: "The category has been successfully deleted.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({
    status: 422,
    description:
      "Unprocessable Entity - Category has associated products or sizes",
  })
  async delete(@Param("id", ParseIntPipe) id: number) {
    await this.deleteCategoryUseCase.execute(id);
    return null;
  }
}

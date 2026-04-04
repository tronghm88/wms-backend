import {
  Controller,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
  ParseIntPipe,
  Get,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CreateProductUseCase } from "../../application/use-cases/products/create-product.use-case";
import { UpdateProductUseCase } from "../../application/use-cases/products/update-product.use-case";
import { ListProductsUseCase } from "../../application/use-cases/products/list-products.use-case";
import { CreateProductDto } from "../dtos/products/create-product.dto";
import { UpdateProductDto } from "../dtos/products/update-product.dto";
import { ProductResponseDto } from "../dtos/products/product-response.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RbacGuard, RequirePermissions } from "../guards/rbac.guard";
import { Permissions } from "../../domain/constants/permissions.constant";

@ApiTags("Products")
@Controller("api/v1/products")
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
  ) {}

  @Get()
  @RequirePermissions(Permissions.PRODUCTS_VIEW)
  @ApiOperation({ summary: "List all products" })
  @ApiResponse({
    status: 200,
    description: "Returns all products with category name and unit code.",
    type: [ProductResponseDto],
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findAll(): Promise<ProductResponseDto[]> {
    return await this.listProductsUseCase.execute();
  }

  @Post()
  @RequirePermissions(Permissions.PRODUCTS_MANAGE)
  @ApiOperation({ summary: "Create a new product" })
  @ApiResponse({
    status: 201,
    description: "The product has been successfully created.",
  })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Category or Unit Not Found" })
  @ApiResponse({ status: 409, description: "Conflict - Code already exists" })
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.createProductUseCase.execute(createProductDto);
  }

  @Patch(":id")
  @RequirePermissions(Permissions.PRODUCTS_MANAGE)
  @ApiOperation({ summary: "Update an existing product" })
  @ApiResponse({
    status: 200,
    description: "The product has been successfully updated.",
  })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({
    status: 404,
    description: "Product, Category or Unit Not Found",
  })
  @ApiResponse({ status: 409, description: "Conflict - Code already exists" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.updateProductUseCase.execute({
      id,
      ...updateProductDto,
    });
  }
}

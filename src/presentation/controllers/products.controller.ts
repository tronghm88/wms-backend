import {
  Controller,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
  ParseIntPipe,
  Get,
  Delete,
  HttpCode,
  UseInterceptors,
} from "@nestjs/common";
import {
  CacheInterceptor,
  CacheKey,
  CacheTTL,
} from "@nestjs/cache-manager";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CreateProductUseCase } from "../../application/use-cases/products/create-product.use-case";
import { UpdateProductUseCase } from "../../application/use-cases/products/update-product.use-case";
import { ListProductsUseCase } from "../../application/use-cases/products/list-products.use-case";
import { GetProductUseCase } from "../../application/use-cases/products/get-product.use-case";
import { GetProductLineageUseCase } from "../../application/use-cases/products/get-product-lineage.use-case";
import { DeleteProductUseCase } from "../../application/use-cases/products/delete-product.use-case";
import { CreateProductDto } from "../dtos/products/create-product.dto";
import { UpdateProductDto } from "../dtos/products/update-product.dto";
import { ProductResponseDto } from "../dtos/products/product-response.dto";
import { ProductLineageResponseDto } from "../dtos/products/product-lineage-response.dto";
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
    private readonly getProductUseCase: GetProductUseCase,
    private readonly getProductLineageUseCase: GetProductLineageUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey("products:all")
  @CacheTTL(300000) // 5 minutes in milliseconds
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

  @Get(":id")
  @RequirePermissions(Permissions.PRODUCTS_VIEW)
  @ApiOperation({ summary: "Get a product by ID" })
  @ApiResponse({
    status: 200,
    description: "Returns the product details.",
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Product Not Found" })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<ProductResponseDto> {
    return await this.getProductUseCase.execute(id);
  }

  @Get(":id/lineage")
  @RequirePermissions(Permissions.PRODUCTS_VIEW)
  @ApiOperation({ summary: "Get product lineage (parent and children)" })
  @ApiResponse({
    status: 200,
    description: "Returns the product lineage details.",
    type: ProductLineageResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Product Not Found" })
  async getLineage(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<ProductLineageResponseDto> {
    const lineage = await this.getProductLineageUseCase.execute(id);
    return new ProductLineageResponseDto(lineage);
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

  @Delete(":id")
  @HttpCode(200)
  @RequirePermissions(Permissions.PRODUCTS_MANAGE)
  @ApiOperation({ summary: "Delete a product" })
  @ApiResponse({
    status: 200,
    description: "The product has been successfully deleted.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Product Not Found" })
  @ApiResponse({
    status: 422,
    description: "Unprocessable Entity - Product has history",
  })
  async remove(@Param("id", ParseIntPipe) id: number): Promise<null> {
    await this.deleteProductUseCase.execute(id);
    return null;
  }
}

import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CreateProductUseCase } from "../../application/use-cases/products/create-product.use-case";
import { CreateProductDto } from "../dtos/products/create-product.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RbacGuard, RequirePermissions } from "../guards/rbac.guard";
import { Permissions } from "../../domain/constants/permissions.constant";

@ApiTags("Products")
@Controller("api/v1/products")
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly createProductUseCase: CreateProductUseCase) {}

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
}

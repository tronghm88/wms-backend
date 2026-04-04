import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CreateCustomerUseCase } from "../../application/use-cases/customers/create-customer.use-case";
import { CreateCustomerDto } from "../dtos/customers/create-customer.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RbacGuard, RequirePermissions } from "../guards/rbac.guard";
import { Permissions } from "../../domain/constants/permissions.constant";

@ApiTags("Customers")
@Controller("api/v1/customers")
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly createCustomerUseCase: CreateCustomerUseCase) {}

  @Post()
  @RequirePermissions(Permissions.CUSTOMERS_MANAGE)
  @ApiOperation({ summary: "Create a new customer" })
  @ApiResponse({
    status: 201,
    description: "The customer has been successfully created.",
  })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 409, description: "Conflict - Code already exists" })
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    const data = await this.createCustomerUseCase.execute(createCustomerDto);
    return {
      statusCode: 201,
      data,
    };
  }
}

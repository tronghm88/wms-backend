import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  Patch,
  Param,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CreateCustomerUseCase } from "../../application/use-cases/customers/create-customer.use-case";
import { GetCustomersUseCase } from "../../application/use-cases/customers/get-customers.use-case";
import { UpdateCustomerUseCase } from "../../application/use-cases/customers/update-customer.use-case";
import { DeleteCustomerUseCase } from "../../application/use-cases/customers/delete-customer.use-case";
import { CreateCustomerDto } from "../dtos/customers/create-customer.dto";
import { GetCustomersDto } from "../dtos/customers/get-customers.dto";
import { UpdateCustomerDto } from "../dtos/customers/update-customer.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RbacGuard, RequirePermissions } from "../guards/rbac.guard";
import { Permissions } from "../../domain/constants/permissions.constant";
import { Delete, HttpCode, HttpStatus } from "@nestjs/common";

@ApiTags("Customers")
@Controller("api/v1/customers")
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly getCustomersUseCase: GetCustomersUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly deleteCustomerUseCase: DeleteCustomerUseCase,
  ) {}

  @Get()
  @RequirePermissions(Permissions.CUSTOMERS_VIEW)
  @ApiOperation({ summary: "Get customer list with pagination and search" })
  @ApiResponse({
    status: 200,
    description: "Returns the customer list.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findAll(@Query() query: GetCustomersDto) {
    const data = await this.getCustomersUseCase.execute(query);
    return {
      statusCode: 200,
      data,
    };
  }

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

  @Patch(":id")
  @RequirePermissions(Permissions.CUSTOMERS_MANAGE)
  @ApiOperation({ summary: "Update an existing customer" })
  @ApiResponse({
    status: 200,
    description: "The customer has been successfully updated.",
  })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 409, description: "Conflict - Code already exists" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    const data = await this.updateCustomerUseCase.execute({
      id,
      ...updateCustomerDto,
    });
    return {
      statusCode: 200,
      data,
    };
  }

  @Delete(":id")
  @RequirePermissions(Permissions.CUSTOMERS_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete an existing customer" })
  @ApiResponse({
    status: 200,
    description: "The customer has been successfully deleted.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Customer has associated tickets",
  })
  async delete(@Param("id", ParseIntPipe) id: number) {
    await this.deleteCustomerUseCase.execute(id);
    return {
      statusCode: 200,
      data: null,
    };
  }
}

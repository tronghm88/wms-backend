import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CreateDiscountPolicyUseCase } from "../../application/use-cases/discount-policies/create-discount-policy.use-case";
import { GetDiscountPoliciesByCustomerUseCase } from "../../application/use-cases/discount-policies/get-discount-policies-by-customer.use-case";
import { CreateDiscountPolicyDto } from "../dtos/discount-policies/create-discount-policy.dto";
import { DiscountPolicyResponseDto } from "../dtos/discount-policies/discount-policy-response.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RbacGuard, RequirePermissions } from "../guards/rbac.guard";
import { Permissions } from "../../domain/constants/permissions.constant";

@ApiTags("Discount Policies")
@Controller("api/v1/discount-policies")
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class DiscountPoliciesController {
  constructor(
    private readonly createDiscountPolicyUseCase: CreateDiscountPolicyUseCase,
    private readonly getDiscountPoliciesByCustomerUseCase: GetDiscountPoliciesByCustomerUseCase,
  ) {}

  @Post()
  @RequirePermissions(Permissions.DISCOUNT_POLICIES_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new discount policy for a customer" })
  @ApiResponse({
    status: 201,
    description: "The discount policy has been successfully created.",
    type: DiscountPolicyResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Not Found - Customer or Product" })
  async create(
    @Body() createDiscountPolicyDto: CreateDiscountPolicyDto,
  ): Promise<DiscountPolicyResponseDto> {
    return await this.createDiscountPolicyUseCase.execute(
      createDiscountPolicyDto,
    );
  }

  @Get("customers/:customerId")
  @RequirePermissions(Permissions.DISCOUNT_POLICIES_VIEW)
  @ApiOperation({ summary: "Get all discount policies for a customer" })
  @ApiResponse({
    status: 200,
    description: "Returns the discount policies for the customer.",
    type: [DiscountPolicyResponseDto],
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Not Found - Customer" })
  async getByCustomer(
    @Param("customerId", ParseIntPipe) customerId: number,
  ): Promise<DiscountPolicyResponseDto[]> {
    return await this.getDiscountPoliciesByCustomerUseCase.execute(customerId);
  }
}

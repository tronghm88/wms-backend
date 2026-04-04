import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
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
import { CreateUserUseCase } from "../../application/use-cases/users/create-user.use-case";
import { UpdateUserUseCase } from "../../application/use-cases/users/update-user.use-case";
import { AdminResetPasswordUseCase } from "../../application/use-cases/users/admin-reset-password.use-case";
import { GetUsersUseCase } from "../../application/use-cases/users/get-users.use-case";
import { GetUserByIdUseCase } from "../../application/use-cases/users/get-user-by-id.use-case";
import { CreateUserDto } from "../dtos/users/create-user.dto";
import { UpdateUserDto } from "../dtos/users/update-user.dto";
import { AdminResetPasswordDto } from "../dtos/users/admin-reset-password.dto";
import { GetUsersDto } from "../dtos/users/get-users.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RequirePermissions, RbacGuard } from "../guards/rbac.guard";
import { Permissions } from "../../domain/constants/permissions.constant";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller("v1/users")
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly adminResetPasswordUseCase: AdminResetPasswordUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permissions.USERS_MANAGE)
  @ApiOperation({
    summary: "Get a list of users with pagination and filtering",
  })
  @ApiResponse({ status: 200, description: "Returns the list of users" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getUsers(@Query() query: GetUsersDto) {
    return this.getUsersUseCase.execute({
      search: query.search,
      role: query.role,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permissions.USERS_MANAGE)
  @ApiOperation({ summary: "Get user by ID" })
  @ApiResponse({ status: 200, description: "Returns the user information" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "User not found" })
  async getUserById(@Param("id", ParseIntPipe) id: number) {
    return this.getUserByIdUseCase.execute(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(Permissions.USERS_MANAGE)
  @ApiOperation({ summary: "Create a new user (Admin only)" })
  @ApiResponse({ status: 201, description: "User successfully created" })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - requires users:manage permission",
  })
  @ApiResponse({ status: 409, description: "Email already exists" })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.createUserUseCase.execute({
      email: createUserDto.email,
      passwordRaw: createUserDto.password,
      fullName: createUserDto.fullName,
      role: createUserDto.role,
      customPermissions: createUserDto.customPermissions,
    });
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permissions.USERS_MANAGE)
  @ApiOperation({ summary: "Update user information (Admin only)" })
  @ApiResponse({ status: 200, description: "User successfully updated" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "User not found" })
  async updateUser(@Param("id") id: number, @Body() dto: UpdateUserDto) {
    return this.updateUserUseCase.execute({
      userId: id,
      fullName: dto.fullName,
      role: dto.role,
      customPermissions: dto.customPermissions,
      status: dto.status,
    });
  }

  @Post(":id/reset-password")
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permissions.USERS_MANAGE)
  @ApiOperation({
    summary: "Reset user password by Admin (no old password required)",
  })
  @ApiResponse({ status: 200, description: "Password successfully reset" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "User not found" })
  async adminResetPassword(
    @Param("id") id: number,
    @Body() dto: AdminResetPasswordDto,
  ) {
    await this.adminResetPasswordUseCase.execute({
      userId: id,
      newPasswordRaw: dto.newPassword,
    });
    return { message: "Password successfully reset by Admin" };
  }
}

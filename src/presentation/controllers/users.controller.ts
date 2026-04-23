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
import { UpdateUserStatusUseCase } from "../../application/use-cases/users/update-user-status.use-case";
import { AdminResetPasswordUseCase } from "../../application/use-cases/users/admin-reset-password.use-case";
import { GetUsersUseCase } from "../../application/use-cases/users/get-users.use-case";
import { GetUserByIdUseCase } from "../../application/use-cases/users/get-user-by-id.use-case";
import { GetUsersStatsUseCase } from "../../application/use-cases/users/get-users-stats.use-case";
import { CreateUserDto } from "../dtos/users/create-user.dto";
import { UpdateUserDto } from "../dtos/users/update-user.dto";
import { AdminResetPasswordDto } from "../dtos/users/admin-reset-password.dto";
import { GetUsersDto } from "../dtos/users/get-users.dto";
import { UserStatsDto } from "../dtos/users/user-stats.dto";
import { UserResponseDto } from "../dtos/users/user-response.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RequirePermissions, RbacGuard } from "../guards/rbac.guard";
import { Permissions } from "../../domain/constants/permissions.constant";
import { UserStatus } from "../../domain/enums";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller("v1/users")
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly updateUserStatusUseCase: UpdateUserStatusUseCase,
    private readonly adminResetPasswordUseCase: AdminResetPasswordUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getUsersStatsUseCase: GetUsersStatsUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permissions.USERS_MANAGE)
  @ApiOperation({
    summary: "Get a list of users with pagination and filtering",
  })
  @ApiResponse({
    status: 200,
    description: "Returns the list of users",
    type: [UserResponseDto],
  })
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

  @Get("stats")
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permissions.USERS_MANAGE)
  @ApiOperation({ summary: "Get user statistics" })
  @ApiResponse({
    status: 200,
    description: "Returns user statistics",
    type: UserStatsDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getStats() {
    return this.getUsersStatsUseCase.execute();
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permissions.USERS_MANAGE)
  @ApiOperation({ summary: "Get user by ID" })
  @ApiResponse({
    status: 200,
    description: "Returns the user information",
    type: UserResponseDto,
  })
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
  @ApiResponse({
    status: 201,
    description: "User successfully created",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - requires users:manage permission",
  })
  @ApiResponse({ status: 409, description: "Email or username already exists" })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.createUserUseCase.execute({
      email: createUserDto.email,
      username: createUserDto.username,
      passwordRaw: createUserDto.password,
      fullName: createUserDto.fullName,
      phone: createUserDto.phone,
      note: createUserDto.note,
      role: createUserDto.role,
      customPermissions: createUserDto.customPermissions,
    });
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permissions.USERS_MANAGE)
  @ApiOperation({ summary: "Update user information (Admin only)" })
  @ApiResponse({
    status: 200,
    description: "User successfully updated",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "User not found" })
  async updateUser(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.updateUserUseCase.execute({
      userId: id,
      username: dto.username,
      fullName: dto.fullName,
      phone: dto.phone,
      note: dto.note,
      role: dto.role,
      customPermissions: dto.customPermissions,
    });
  }

  @Patch(":id/active")
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permissions.USERS_MANAGE)
  @ApiOperation({ summary: "Activate a user account (Admin only)" })
  @ApiResponse({
    status: 200,
    description: "User successfully activated",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - requires users:manage permission",
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async activateUser(@Param("id", ParseIntPipe) id: number) {
    return this.updateUserStatusUseCase.execute({
      userId: id,
      status: UserStatus.ACTIVE,
    });
  }

  @Patch(":id/inactive")
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permissions.USERS_MANAGE)
  @ApiOperation({ summary: "Deactivate a user account (Admin only)" })
  @ApiResponse({
    status: 200,
    description: "User successfully deactivated",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - requires users:manage permission",
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async deactivateUser(@Param("id", ParseIntPipe) id: number) {
    return this.updateUserStatusUseCase.execute({
      userId: id,
      status: UserStatus.INACTIVE,
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
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: AdminResetPasswordDto,
  ) {
    await this.adminResetPasswordUseCase.execute({
      userId: id,
      newPasswordRaw: dto.newPassword,
    });
    return null;
  }
}

import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CreateUserUseCase } from "../../application/use-cases/users/create-user.use-case";
import { CreateUserDto } from "../dtos/users/create-user.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RequirePermissions, RbacGuard } from "../guards/rbac.guard";
import { Permissions } from "../../domain/constants/permissions.constant";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller("v1/users")
export class UsersController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

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
}

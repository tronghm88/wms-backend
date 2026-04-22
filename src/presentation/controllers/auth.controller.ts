import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { LoginUseCase } from "../../application/use-cases/auth/login.use-case";
import { ResetPasswordUseCase } from "../../application/use-cases/auth/reset-password.use-case";
import { LoginDto } from "../dtos/auth/login.dto";
import { ResetPasswordDto } from "../dtos/auth/reset-password.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

@ApiTags("Auth")
@Controller("v1/auth")
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Authenticate user and return JWT tokens" })
  @ApiResponse({ status: 200, description: "Successful login" })
  @ApiResponse({ status: 400, description: "Invalid credentials" })
  async login(@Body() loginDto: LoginDto) {
    return this.loginUseCase.execute({
      email: loginDto.email,
      passwordRaw: loginDto.password,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Reset password for the authenticated user" })
  @ApiResponse({ status: 200, description: "Password successfully reset" })
  @ApiResponse({ status: 400, description: "Invalid old password" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async resetPassword(
    @Request()
    req: { user: { id: number; role: string; permissions: string[] } },
    @Body() dto: ResetPasswordDto,
  ) {
    await this.resetPasswordUseCase.execute({
      userId: req.user.id,
      oldPasswordRaw: dto.oldPassword,
      newPasswordRaw: dto.newPassword,
    });
    return null;
  }
}

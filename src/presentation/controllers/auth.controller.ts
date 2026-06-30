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
import { RefreshTokenUseCase } from "../../application/use-cases/auth/refresh-token.use-case";
import { LogoutUseCase } from "../../application/use-cases/auth/logout.use-case";
import { LoginDto } from "../dtos/auth/login.dto";
import { ResetPasswordDto } from "../dtos/auth/reset-password.dto";
import { RefreshTokenDto } from "../dtos/auth/refresh-token.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

@ApiTags("Auth")
@Controller("v1/auth")
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
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

  @Post("refresh-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Refresh access token using a valid refresh token",
    description:
      "Issues a new access token and rotates the refresh token. The old refresh token is invalidated immediately.",
  })
  @ApiResponse({ status: 200, description: "New token pair issued" })
  @ApiResponse({
    status: 401,
    description: "Invalid or expired refresh token",
  })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute({
      refreshToken: dto.refreshToken,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Logout the current user",
    description:
      "Immediately invalidates the session in Redis. The access token will be rejected on the next request even if it has not expired yet.",
  })
  @ApiResponse({ status: 204, description: "Logged out successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async logout(
    @Request()
    req: {
      user: { id: number; role: string; permissions: string[] };
    },
  ) {
    await this.logoutUseCase.execute({ userId: req.user.id });
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

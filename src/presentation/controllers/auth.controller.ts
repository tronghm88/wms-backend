import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { LoginUseCase } from "../../application/use-cases/auth/login.use-case";
import { LoginDto } from "../dtos/auth/login.dto";

@ApiTags("Auth")
@Controller("v1/auth")
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

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
}

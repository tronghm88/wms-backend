import { Injectable, Inject } from "@nestjs/common";
import { USER_REPOSITORY } from "../../../domain/contracts/user.repository.interface";
import type { IUserRepository } from "../../../domain/contracts/user.repository.interface";
import { PASSWORD_HASHER } from "../../../domain/contracts/password-hasher.interface";
import type { IPasswordHasher } from "../../../domain/contracts/password-hasher.interface";
import { TOKEN_SERVICE } from "../../../domain/contracts/token.service.interface";
import type { ITokenService } from "../../../domain/contracts/token.service.interface";
import { CACHE_SERVICE } from "../../../domain/contracts/cache.service.interface";
import type { ICacheService } from "../../../domain/contracts/cache.service.interface";
import {
  InvalidCredentialsException,
  UserInactiveException,
} from "../../../domain/exceptions/auth.exceptions";

export interface LoginRequest {
  email: string;
  passwordRaw: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    role: string;
    fullName: string;
  };
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
    @Inject(CACHE_SERVICE) private readonly cacheService: ICacheService,
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    const isEmail = request.email.includes("@");
    const user = isEmail
      ? await this.userRepository.findByEmail(request.email)
      : await this.userRepository.findByUsername(request.email);

    if (!user) {
      throw new InvalidCredentialsException();
    }

    if (!user.isActive()) {
      throw new UserInactiveException();
    }

    const isPasswordValid = await this.passwordHasher.compare(
      request.passwordRaw,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const tokens = await this.tokenService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const hashedRefreshToken = await this.tokenService.hashToken(
      tokens.refreshToken,
    );

    await this.cacheService.set(
      `session:refresh_token:${user.id}`,
      hashedRefreshToken,
      604800,
    );

    const activePermissions =
      user.customPermissions !== null ? user.customPermissions : [user.role];
    await this.cacheService.set(
      `session:user_data:${user.id}`,
      {
        id: user.id,
        role: user.role,
        permissions: activePermissions,
      },
      604800,
    );

    await this.userRepository.updateLastLogin(user.id);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    };
  }
}

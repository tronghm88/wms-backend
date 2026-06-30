import { Injectable, Inject, UnauthorizedException } from "@nestjs/common";
import { TOKEN_SERVICE } from "../../../domain/contracts/token.service.interface";
import type {
  ITokenService,
  ITokenPayload,
} from "../../../domain/contracts/token.service.interface";
import { CACHE_SERVICE } from "../../../domain/contracts/cache.service.interface";
import type { ICacheService } from "../../../domain/contracts/cache.service.interface";

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
    @Inject(CACHE_SERVICE) private readonly cacheService: ICacheService,
  ) {}

  async execute(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    // Step 1: SHA-256 hash the incoming token to build the Redis lookup key
    const incomingHash = this.tokenService.sha256Token(request.refreshToken);

    // Step 2: Lookup token data by its hash
    const tokenData = await this.cacheService.get<ITokenPayload>(
      `session:refresh_token:${incomingHash}`,
    );

    if (!tokenData) {
      // Could be: expired, already used (reuse attack), or never existed
      throw new UnauthorizedException("Invalid or expired refresh token.");
    }

    const { userId, email, role } = tokenData;

    // Step 3: Verify the user session gate is still alive
    const userData = await this.cacheService.get<{
      id: number;
      role: string;
      permissions: string[];
    }>(`session:user_data:${userId}`);

    if (!userData) {
      // Session was externally revoked (admin disabled user, etc.)
      await this.cacheService.del(`session:refresh_token:${incomingHash}`);
      await this.cacheService.del(`session:refresh_token_ref:${userId}`);
      throw new UnauthorizedException("Session expired. Please login again.");
    }

    // Step 4: Immediately invalidate old refresh token (token rotation)
    // This detects reuse attacks — a second use of same token will fail at Step 2
    await this.cacheService.del(`session:refresh_token:${incomingHash}`);
    await this.cacheService.del(`session:refresh_token_ref:${userId}`);

    // Step 5: Issue new token pair
    const newTokens = await this.tokenService.generateTokens({
      userId,
      email,
      role,
    });

    // Step 6: Store new refresh token with sliding window TTL reset
    const newHash = this.tokenService.sha256Token(newTokens.refreshToken);

    await this.cacheService.set(
      `session:refresh_token:${newHash}`,
      { userId, email, role },
      REFRESH_TOKEN_TTL_SECONDS,
    );

    await this.cacheService.set(
      `session:refresh_token_ref:${userId}`,
      newHash,
      REFRESH_TOKEN_TTL_SECONDS,
    );

    // Step 7: Sliding window — reset session:user_data TTL
    await this.cacheService.set(
      `session:user_data:${userId}`,
      userData,
      REFRESH_TOKEN_TTL_SECONDS,
    );

    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    };
  }
}

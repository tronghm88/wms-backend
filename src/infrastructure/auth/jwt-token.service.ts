import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { createHash, randomBytes } from "crypto";
import {
  ITokenService,
  ITokenPayload,
  ITokens,
} from "../../domain/contracts/token.service.interface";

const ACCESS_TOKEN_TTL = "15m";

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateTokens(payload: ITokenPayload): Promise<ITokens> {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: ACCESS_TOKEN_TTL,
    });

    const refreshToken = this.generateRefreshToken();

    return { accessToken, refreshToken };
  }

  generateRefreshToken(): string {
    // 32 random bytes → 64-char hex opaque token
    return randomBytes(32).toString("hex");
  }

  sha256Token(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}

import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import {
  ITokenService,
  ITokenPayload,
  ITokens,
} from "../../domain/contracts/token.service.interface";
import { randomBytes } from "crypto";

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateTokens(payload: ITokenPayload): Promise<ITokens> {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: "15m",
    });

    const refreshToken = this.generateRefreshToken();

    return {
      accessToken,
      refreshToken,
    };
  }

  generateRefreshToken(): string {
    return randomBytes(32).toString("hex");
  }

  async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }
}

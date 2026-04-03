import { Injectable, UnauthorizedException, Inject } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ITokenPayload } from "../../domain/contracts/token.service.interface";
import { CACHE_SERVICE } from "../../domain/contracts/cache.service.interface";
import type { ICacheService } from "../../domain/contracts/cache.service.interface";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @Inject(CACHE_SERVICE) private cacheService: ICacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        "JWT_SECRET",
        "super-secret-key-for-dev",
      ),
    });
  }

  async validate(payload: ITokenPayload) {
    const userData = await this.cacheService.get<{
      id: string;
      role: string;
      permissions: string[];
    }>(`session:user_data:${payload.userId}`);

    if (!userData) {
      throw new UnauthorizedException("Session expired or invalid");
    }

    return userData;
  }
}

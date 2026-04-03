import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "../../presentation/controllers/auth.controller";
import { LoginUseCase } from "../../application/use-cases/auth/login.use-case";
import { JwtTokenService } from "./jwt-token.service";
import { BcryptPasswordHasher } from "./bcrypt-password-hasher.service";
import { JwtStrategy } from "./jwt.strategy";
import { UserRepository } from "../database/repositories/user.repository";
import { PrismaModule } from "../database/prisma.module";
import { RedisCacheService } from "../cache/redis-cache.service";
import { USER_REPOSITORY } from "../../domain/contracts/user.repository.interface";
import { PASSWORD_HASHER } from "../../domain/contracts/password-hasher.interface";
import { TOKEN_SERVICE } from "../../domain/contracts/token.service.interface";
import { CACHE_SERVICE } from "../../domain/contracts/cache.service.interface";

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(
          "JWT_SECRET",
          "super-secret-key-for-dev",
        ),
        signOptions: { expiresIn: "15m" },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    JwtStrategy,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenService,
    },
    {
      provide: CACHE_SERVICE,
      useClass: RedisCacheService,
    },
  ],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}

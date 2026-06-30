import { Injectable, Inject } from "@nestjs/common";
import { CACHE_SERVICE } from "../../../domain/contracts/cache.service.interface";
import type { ICacheService } from "../../../domain/contracts/cache.service.interface";

export interface LogoutRequest {
  userId: number;
}

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(CACHE_SERVICE) private readonly cacheService: ICacheService,
  ) {}

  async execute(request: LogoutRequest): Promise<void> {
    const { userId } = request;

    // Revoke access gate immediately
    await this.cacheService.del(`session:user_data:${userId}`);

    // Revoke refresh token via reverse index (opaque token two-key pattern)
    const tokenHash = await this.cacheService.get<string>(
      `session:refresh_token_ref:${userId}`,
    );
    if (tokenHash) {
      await this.cacheService.del(`session:refresh_token:${tokenHash}`);
    }
    await this.cacheService.del(`session:refresh_token_ref:${userId}`);
  }
}

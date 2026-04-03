import { Injectable, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { ICacheService } from "../../domain/contracts/cache.service.interface";

@Injectable()
export class RedisCacheService implements ICacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    const val = await this.cacheManager.get<T>(key);
    return val ?? null;
  }

  async set(key: string, value: unknown, ttlInSeconds?: number): Promise<void> {
    // Note: cache-manager uses milliseconds for ttl, unless redis-store is configured otherwise.
    // We pass milliseconds by multiplying by 1000.
    const ttl = ttlInSeconds ? ttlInSeconds * 1000 : 0;
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }
}

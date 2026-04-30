import { Module } from "@nestjs/common";
import { AppController } from "./presentation/controllers/app.controller";
import { AppService } from "./application/use-cases/app.service";
import { PrismaModule } from "./infrastructure/database/prisma.module";
import { AuthModule } from "./infrastructure/auth/auth.module";
import { UsersModule } from "./infrastructure/users/users.module";
import { UnitsModule } from "./infrastructure/units/units.module";
import { CategoriesModule } from "./infrastructure/categories/categories.module";
import { ProductsModule } from "./infrastructure/products/products.module";
import { UnitConversionsModule } from "./infrastructure/unit-conversions/unit-conversions.module";
import { CustomersModule } from "./infrastructure/customers/customers.module";
import { DiscountPoliciesModule } from "./infrastructure/discount-policies/discount-policies.module";
import { ReceiptTicketsModule } from "./infrastructure/receipt-tickets/receipt-tickets.module";
import { IssueTicketsModule } from "./infrastructure/issue-tickets/issue-tickets.module";
import { SplitTicketsModule } from "./infrastructure/split-tickets/split-tickets.module";
import { StockModule } from "./infrastructure/stock/stock.module";
import { Keyv } from "keyv";
import KeyvRedis from "@keyv/redis";
import { KeyvCacheableMemory } from "cacheable";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl =
          configService.get<string>("REDIS_URL") ?? "redis://localhost:6379";
        return {
          stores: [
            new Keyv({
              store: new KeyvCacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            new KeyvRedis(redisUrl),
          ],
        };
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    UnitsModule,
    CategoriesModule,
    ProductsModule,
    UnitConversionsModule,
    CustomersModule,
    DiscountPoliciesModule,
    ReceiptTicketsModule,
    IssueTicketsModule,
    SplitTicketsModule,
    StockModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

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
import { ConfigModule } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
// import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({
      isGlobal: true,
      // For MVP/Story1.1 keeping memory cache to pass compilation if redis is not up,
      // but Architecture states Redis. Will add redis later when robust.
      // store: redisStore,
      // host: 'localhost',
      // port: 6379,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

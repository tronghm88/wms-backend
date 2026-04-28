import { Module } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { CategoriesModule } from "../categories/categories.module";
import { UnitsModule } from "../units/units.module";
import { PRODUCT_REPOSITORY } from "../../domain/contracts/product.repository.interface";
import { ProductRepository } from "../database/repositories/product.repository";
import { CreateProductUseCase } from "../../application/use-cases/products/create-product.use-case";
import { UpdateProductUseCase } from "../../application/use-cases/products/update-product.use-case";
import { ListProductsUseCase } from "../../application/use-cases/products/list-products.use-case";
import { GetProductUseCase } from "../../application/use-cases/products/get-product.use-case";
import { GetProductLineageUseCase } from "../../application/use-cases/products/get-product-lineage.use-case";
import { GetProductStatsUseCase } from "../../application/use-cases/products/get-product-stats.use-case";
import { DeleteProductUseCase } from "../../application/use-cases/products/delete-product.use-case";
import { ProductsController } from "../../presentation/controllers/products.controller";
import { StockModule } from "../stock/stock.module";
import { UnitConversionsModule } from "../unit-conversions/unit-conversions.module";
import { forwardRef } from "@nestjs/common";

@Module({
  imports: [
    PrismaModule,
    CategoriesModule,
    UnitsModule,
    StockModule,
    forwardRef(() => UnitConversionsModule),
  ],
  controllers: [ProductsController],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductRepository,
    },
    CreateProductUseCase,
    UpdateProductUseCase,
    ListProductsUseCase,
    GetProductUseCase,
    GetProductLineageUseCase,
    GetProductStatsUseCase,
    DeleteProductUseCase,
  ],
  exports: [
    PRODUCT_REPOSITORY,
    CreateProductUseCase,
    UpdateProductUseCase,
    ListProductsUseCase,
    GetProductUseCase,
    GetProductLineageUseCase,
    GetProductStatsUseCase,
    DeleteProductUseCase,
  ],
})
export class ProductsModule {}

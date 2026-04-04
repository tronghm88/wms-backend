import { Module } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { CategoriesModule } from "../categories/categories.module";
import { UnitsModule } from "../units/units.module";
import { PRODUCT_REPOSITORY } from "../../domain/contracts/product.repository.interface";
import { ProductRepository } from "../database/repositories/product.repository";
import { CreateProductUseCase } from "../../application/use-cases/products/create-product.use-case";
import { UpdateProductUseCase } from "../../application/use-cases/products/update-product.use-case";
import { ListProductsUseCase } from "../../application/use-cases/products/list-products.use-case";
import { ProductsController } from "../../presentation/controllers/products.controller";

@Module({
  imports: [PrismaModule, CategoriesModule, UnitsModule],
  controllers: [ProductsController],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductRepository,
    },
    CreateProductUseCase,
    UpdateProductUseCase,
    ListProductsUseCase,
  ],
  exports: [
    PRODUCT_REPOSITORY,
    CreateProductUseCase,
    UpdateProductUseCase,
    ListProductsUseCase,
  ],
})
export class ProductsModule {}

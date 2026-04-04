import { Module } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { CategoriesModule } from "../categories/categories.module";
import { UnitsModule } from "../units/units.module";
import { PRODUCT_REPOSITORY } from "../../domain/contracts/product.repository.interface";
import { ProductRepository } from "../database/repositories/product.repository";
import { CreateProductUseCase } from "../../application/use-cases/products/create-product.use-case";
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
  ],
  exports: [PRODUCT_REPOSITORY, CreateProductUseCase],
})
export class ProductsModule {}

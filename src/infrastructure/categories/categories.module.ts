import { Module } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { CATEGORY_REPOSITORY } from "../../domain/contracts/category.repository.interface";
import { CategoryRepository } from "../database/repositories/category.repository";
import { CreateCategoryUseCase } from "../../application/use-cases/categories/create-category.use-case";
import { UpdateCategoryUseCase } from "../../application/use-cases/categories/update-category.use-case";
import { CategoriesController } from "../../presentation/controllers/categories.controller";

@Module({
  imports: [PrismaModule],
  controllers: [CategoriesController],
  providers: [
    {
      provide: CATEGORY_REPOSITORY,
      useClass: CategoryRepository,
    },
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
  ],
  exports: [CATEGORY_REPOSITORY, CreateCategoryUseCase, UpdateCategoryUseCase],
})
export class CategoriesModule {}

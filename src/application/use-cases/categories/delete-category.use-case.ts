import { Injectable, Inject } from "@nestjs/common";
import { CATEGORY_REPOSITORY } from "../../../domain/contracts/category.repository.interface";
import type { ICategoryRepository } from "../../../domain/contracts/category.repository.interface";
import {
  CategoryNotFoundException,
  CategoryHasProductsException,
  CategoryHasSizesException,
} from "../../../domain/exceptions/category.exceptions";

@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new CategoryNotFoundException(id);
    }

    const hasProducts = await this.categoryRepository.hasProducts(id);
    if (hasProducts) {
      throw new CategoryHasProductsException(id);
    }

    const hasSizes = await this.categoryRepository.hasSizes(id);
    if (hasSizes) {
      throw new CategoryHasSizesException(id);
    }

    await this.categoryRepository.delete(id);
  }
}
